using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace DotnetAPIProject.Services.Implementations
{
    public class ExamService : IExamsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITopicService _topicService;
        private readonly IProficiencyService _proficiencyService;
        private readonly IQuestionService _questionService;
        private readonly IListeningExamService _listeningExamService;

        public ExamService(ApplicationDbContext context, ITopicService topicService, IProficiencyService proficiencyService, IQuestionService questionService, IListeningExamService listeningExamService)
        {
            _context = context;
            _topicService = topicService;
            _proficiencyService = proficiencyService;
            _questionService = questionService;
            _listeningExamService = listeningExamService;
        }

        public async Task<IEnumerable<ExamDto>> GetExamAsync(Guid? topicId)
        {
            var query = _context.Exams
                .Include(qs => qs.Topic) //
                .Select(qs => new ExamDto
                {
                    IdExam = qs.Id,
                    NameExam = qs.Name,
                    Skill = qs.Skill,

                    Topic = new TopicDto
                    {
                        IdTopic = qs.TopicId,
                        Name = qs.Topic.Name
                    }
                });

            if (topicId.HasValue)
            {
                query = query.Where(qs => qs.Topic.IdTopic == topicId.Value);
            }
            return await query.ToListAsync();
        }

        public async Task<ExamDto> CreateExamAsync(CreateExamDto examDto)
        {
            var exam = new Exam
            {
                Id = Guid.NewGuid(),
                Name = examDto.NameExam,
                TopicId = examDto.TopicID,
                Time = examDto.Time,
                Skill = examDto.Skill,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            return new ExamDto
            {
                IdExam = exam.Id,
                NameExam = exam.Name,
                Skill = exam.Skill,
                Topic = new TopicDto
                {
                    IdTopic = exam.TopicId,
                    Name = (await _context.Topics.FindAsync(exam.TopicId))?.Name
                }
            };
        }

        public async Task<IEnumerable<ListeningExamResponseDto>> GetListeningExamByProficiencyIdAsync(Guid proficiencyId)
        {
            try
            {
                // Join Exams with Topics and Proficiencies, apply filters
                var query = from e in _context.Exams
                            join t in _context.Topics on e.TopicId equals t.Id
                            join p in _context.Proficiencies on t.ProficienciesId equals p.Id
                            where p.Id == proficiencyId
                                && t.Name == "All"
                                && e.Skill.ToLower() == "listening"
                            select new
                            {
                                Exam = e,
                                Topic = t
                            };

                var exams = await query.ToListAsync();

                // Join exams with their ListeningExam info
                var result = await Task.WhenAll(exams.Select(async x =>
                {
                    var listeningInfo = await _context.ListeningExams.FirstOrDefaultAsync(le => le.ExamId == x.Exam.Id);
                    var proficiency = await _proficiencyService.GetProficiencyByIdAsync(proficiencyId);
                    var questions = await _questionService.GetAllQuestionsByExamIdAsync(x.Exam.Id);

                    return new ListeningExamResponseDto
                    {
                        Id = x.Exam.Id,
                        Name = x.Exam.Name,
                        Topic = new TopicDto
                        {
                            IdTopic = x.Topic.Id,
                            Name = x.Topic.Name,
                            Proficiency = new ProficiencyResponseDto
                            {
                                Id = proficiency.Id,
                                Name = proficiency.Name,
                                Band = proficiency.Band,
                                Description = proficiency.Description,
                                Skill = proficiency.Skill
                            }
                        },
                        Time = (int)x.Exam.Time,
                        Skill = x.Exam.Skill,
                        NumberOfQuestions = questions.Count(),
                        Infor = listeningInfo == null ? null : new ListeningInforDto
                        {
                            Transcript = listeningInfo.Transcript,
                            AudioUrl = listeningInfo.AudioUrl,
                            ImageUrl = listeningInfo.ImageUrl,
                            Direction = listeningInfo.Direction
                        }
                    };
                }));

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<ListeningExamHaveAnswerResponseDto> GetDetailListeningExamByIdAsync(Guid examId)
        {
            var exam = await _context.Exams.FirstOrDefaultAsync(e => e.Id == examId);

            if (exam == null)
                throw new Exception("Listening exam not found.");

            var topic = await _topicService.GetTopicByIdAsync(exam.TopicId);

            if (topic == null)
                throw new Exception("Topic not found.");

            var listeningInfo = await _context.ListeningExams.FirstOrDefaultAsync(le => le.ExamId == examId);

            if (listeningInfo == null)
                throw new Exception("Listening info not found.");

            // Fetch questions related to the exam
            var listeningQuestions = await _questionService.GetAllListeningQuestionsByExamIdAsync(examId);

            Console.WriteLine(listeningQuestions.Count());

            return new ListeningExamHaveAnswerResponseDto
            {
                Id = exam.Id,
                Name = exam.Name,
                Time = exam.Time,
                Skill = exam.Skill,
                Topic = topic,
                Infor = new ListeningInforDto
                {
                    Transcript = listeningInfo.Transcript,
                    AudioUrl = listeningInfo.AudioUrl,
                    ImageUrl = listeningInfo.ImageUrl,
                    Direction = listeningInfo.Direction
                },
                questions = listeningQuestions.ToList()
            };
        }

        public async Task<ListeningExamResponseDto> CreateListeningExamAsync(ListeningExamCreateDto listeningExamDto)
        {
            try
            {
                var exam = new CreateExamDto
                {
                    NameExam = listeningExamDto.Name,
                    TopicID = listeningExamDto.TopicId,
                    Time = listeningExamDto.Time,
                    Skill = listeningExamDto.Skill,
                };

                var createdExam = await CreateExamAsync(exam);

                var listeningInfor = await _listeningExamService.CreateListeningExamInforAsync(createdExam.IdExam, listeningExamDto.Infor);

                var listeningExam = new ListeningExamResponseDto
                {
                    Id = createdExam.IdExam,
                    Name = createdExam.NameExam,
                    Topic = createdExam.Topic,
                    //Time = createdExam.Time,
                    Skill = createdExam.Skill,
                    Infor = listeningInfor,
                };

                return listeningExam;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<bool> DeleteExamByIdAsync(Guid examId)
        {
            try
            {
                var exam = await _context.Exams.FindAsync(examId);
                if (exam == null)
                    return false;

                _context.Exams.Remove(exam);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}