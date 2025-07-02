using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace DotnetAPIProject.Services.Implementations
{

    public class UserExamService : IUserExamService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDetailUserExamService _detailUserExamService;
        private readonly IExamsService _examService;



        public UserExamService(ApplicationDbContext context, IDetailUserExamService detailUserExamService, IExamsService examService)
        {
            _context = context;
            _detailUserExamService = detailUserExamService;
            _examService = examService;
        }
        public async Task<UserExam> CheckUserExamExistsAsync(Guid userId, Guid examId)
        {
            try
            {
                // Check if a UserExam exists for the given userId and examId
                var userExam = await _context.UserExams
                    .FirstOrDefaultAsync(ue => ue.UserId == userId && ue.ExamId == examId);

                if (userExam != null)
                {
                    return userExam; // Return the existing UserExam
                }

                return null; // No UserExam found
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<UserExamDto> CreateListeningUserExamAsync(UserExamCreateDto createDto)
        {
            //Double-check the UserId in your request payload.
            if (createDto.UserId == Guid.Empty)
                throw new ArgumentException("UserId cannot be empty");
            try
            {
                var userExam = new UserExam
                {
                    Id = Guid.NewGuid(),
                    FinishedTime = createDto.FinishedTime,
                    Status = createDto.Status,
                    ExamId = createDto.ExamId,
                    UserId = createDto.UserId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.UserExams.Add(userExam);
                // Save UserExam first to ensure FK constraint is satisfied
                await _context.SaveChangesAsync();

                var UserAnswers = new List<DetailUserExamDto>();

                foreach (var answer in createDto.UserAnswers)
                {
                    var result = await _detailUserExamService.CreateDetailUserExamAsync(userExam.Id, createDto.Status, answer);
                    UserAnswers.Add(result);
                }

                // Save DetailUserExams after all are added
                await _context.SaveChangesAsync();

                var response = new UserExamDto
                {
                    Id = userExam.Id,
                    FinishedTime = userExam.FinishedTime.Value,
                    Status = userExam.Status,
                    ExamId = userExam.ExamId,
                    UserId = userExam.UserId,
                    UserAnswers = UserAnswers
                };
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<UserExam>> GetAllListeningUserExamAsync(Guid userId)
        {
            try
            {
                // Join UserExams with Exams, Topics, and Proficiencies to filter by Listening
                var userExams = await _context.UserExams
                    .Where(ue => ue.UserId == userId)
                    .Join(_context.Exams,
                        ue => ue.ExamId,
                        e => e.Id,
                        (ue, e) => new { ue, e })
                    .Join(_context.Topics,
                        ue_e => ue_e.e.TopicId,
                        t => t.Id,
                        (ue_e, t) => new { ue_e.ue, ue_e.e, t })
                    .Join(_context.Proficiencies,
                        ue_e_t => ue_e_t.t.ProficienciesId,
                        p => p.Id,
                        (ue_e_t, p) => new { ue_e_t.ue, ue_e_t.e, ue_e_t.t, p })
                    .Where(x => x.p.Skill.ToLower() == "listening")
                    .Select(x => x.ue)
                    .ToListAsync();
                return userExams;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<UserExamListeningResponseDto> GetListeningUserExamByIdAsync(Guid id)
        {
            try
            {
                var userExam = await _context.UserExams.FindAsync(id);
                if (userExam == null)
                    throw new Exception("UserExam not found");

                var listeningExam = await _examService.GetDetailListeningExamByIdAsync(userExam.ExamId);
                if (listeningExam == null)
                    throw new Exception("ListeningExam not found");

                var result = await _detailUserExamService.GetAllDetailUserExamByUserExamIdAsync(userExam.Id);

                var response = new UserExamListeningResponseDto
                {
                    Id = userExam.Id,
                    FinishedTime = userExam.FinishedTime.Value,
                    Status = userExam.Status,
                    ListeningExam = new ListeningExamResponseDto
                    {
                        Id = listeningExam.Id,
                        Name = listeningExam.Name,
                        Topic = listeningExam.Topic,
                        Time = (int)listeningExam.Time,
                        Skill = listeningExam.Skill,
                        NumberOfQuestions = listeningExam.questions.Count,
                        Infor = listeningExam.Infor
                    },
                    UserId = userExam.UserId,
                    Result = result
                };

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<UserExamDto> UpdateUserExamAsync(Guid userExamId, UserExamUpdateDto updateDto)
        {
            try
            {
                var userExam = await _context.UserExams.FindAsync(userExamId);
                if (userExam == null)
                    throw new Exception("UserExam not found");

                // Update properties
                userExam.FinishedTime = updateDto.FinishedTime;
                userExam.Status = updateDto.Status;
                userExam.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Update, create, and delete DetailUserExams as needed
                List<DetailUserExamDto> userAnswers = new();
                if (updateDto.UserAnswers != null)
                {
                    var incomingQuestionIds = updateDto.UserAnswers.Select(a => a.QuestionId).ToList();
                    var existingDetails = await _context.DetailUserExams
                        .Where(d => d.UserExamId == userExamId)
                        .ToListAsync();

                    // Delete details not in the update DTO
                    var toDelete = existingDetails.Where(d => !incomingQuestionIds.Contains(d.QuestionId)).ToList();
                    if (toDelete.Any())
                    {
                        _context.DetailUserExams.RemoveRange(toDelete);
                        await _context.SaveChangesAsync();
                    }
                    Console.WriteLine($"Deleted {toDelete.Count} DetailUserExams");

                    // create
                    Console.WriteLine($"Creating {updateDto.UserAnswers.Count} DetailUserExams");
                    foreach (var answer in updateDto.UserAnswers)
                    {
                        var created = await _detailUserExamService.CreateDetailUserExamAsync(userExamId, updateDto.Status, new DetailUserExamCreateDto
                        {
                            QuestionId = answer.QuestionId,
                            AnswerId = answer.AnswerId,
                            IsMarked = answer.IsMarked
                        });
                        userAnswers.Add(created);
                    }
                }

                var response = new UserExamDto
                {
                    Id = userExam.Id,
                    FinishedTime = userExam.FinishedTime.Value,
                    Status = userExam.Status,
                    ExamId = userExam.ExamId,
                    UserId = userExam.UserId,
                    UserAnswers = userAnswers
                };

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        
        public async Task<bool> DeleteUserExamAsync(Guid userExamId)
        {
            try
            {
                var userExam = await _context.UserExams.FindAsync(userExamId);
                if (userExam == null)
                    throw new Exception("UserExam not found");

                // Delete all DetailUserExams associated with this UserExam
                var detailUserExams = await _context.DetailUserExams
                    .Where(d => d.UserExamId == userExamId)
                    .ToListAsync();
                _context.DetailUserExams.RemoveRange(detailUserExams);

                // Delete the UserExam itself
                _context.UserExams.Remove(userExam);

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