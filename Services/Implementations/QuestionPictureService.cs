using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DotnetAPIProject.Services.Implementations
{
    public class QuestionPictureService : IQuestionPictureService
    {
        private readonly ApplicationDbContext _context;

        public QuestionPictureService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<QuestionPictureDto>> GetQuestionsAsync(Guid examId)
        {
            try
            {
                Console.WriteLine($"[INFO] Fetching questions for ExamID: {examId}");

                var questions = await _context.Questions
                    .Where(q => q.ExamId == examId)
                    .Include(q => q.QuestionText)
                    .Include(q => q.QuestionImages)
                    .ToListAsync();

                Console.WriteLine($"[INFO] Found {questions.Count} questions");

                if (questions == null || !questions.Any())
                {
                    Console.WriteLine("[WARNING] No questions found");
                    return new List<QuestionPictureDto>();
                }
                var random = new Random();
                var shuffledQuestions = questions.OrderBy(q => random.Next()).ToList();
                var dtos = new List<QuestionPictureDto>();
                foreach (var q in shuffledQuestions)
                {
                    string typeQuestion = q.TypeQuestion?.Trim();
                    Console.WriteLine($"[DEBUG] Processing Question ID: {q.Id} | Type: {typeQuestion}");
                    var dto = new QuestionPictureDto
                    {
                        QuestionID = q.Id,
                        QuestionType = typeQuestion ?? "unknown",
                        TextQuestion = (typeQuestion == "1" && q.QuestionText != null)
                            ? q.QuestionText.TextQuestion
                            : (typeQuestion == "2" && q.QuestionImages != null)
                                ? q.QuestionImages.QuestionImagesText ?? "Chọn ảnh đúng"
                                : null,
                        CorrectAnswer = typeQuestion == "1" ? q.QuestionText?.CorrectAnswer : null,
                        CorrectImg = typeQuestion == "1" ? q.QuestionText?.CorrectImg : null,
                        ImageOptions = typeQuestion == "2" && q.QuestionImages != null
                            ? new List<ImageOptionDto>
                            {
                        new ImageOptionDto
                        {
                            QuestionImagesText = q.QuestionImages.QuestionImagesText ?? "Đáp án đúng",
                            ImageCode = q.QuestionImages.CorrectImg ?? "300101",
                            IsCorrect = 1
                        },
                        new ImageOptionDto
                        {
                            QuestionImagesText = "Sai 1",
                            ImageCode = q.QuestionImages.WrongImg1 ?? "300101",
                            IsCorrect = 0
                        },
                        new ImageOptionDto
                        {
                            QuestionImagesText = "Sai 2",
                            ImageCode = q.QuestionImages.WrongImg2 ?? "300101",
                            IsCorrect = 0
                        }
                            }.OrderBy(x => random.Next()).ToList()
                            : null
                    };

                    if (typeQuestion == "2")
                    {
                        if (dto.ImageOptions == null || dto.ImageOptions.Count != 3)
                        {
                            Console.WriteLine($"[WARNING] QuestionID {q.Id} thiếu image options");
                        }
                    }

                    dtos.Add(dto);
                }

                return dtos;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetQuestionsAsync failed: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                throw new Exception("Lỗi khi lấy dữ liệu câu hỏi", ex);
            }
        }
        // add history
        public async Task<IEnumerable<UserExam>> GetResultUserExamAsync()
        {
            return await _context.UserExams.ToListAsync();  
        }
        public async Task<UserExam> CreateUserExamHistoryAsync(CreateUserExamHistoryDto dto)
        {
            var userExists = await _context.Accounts.AnyAsync(a => a.Id == dto.UserId);
            var examExists = await _context.Exams.AnyAsync(e => e.Id == dto.ExamId);

            if (!userExists)
                throw new ArgumentException($"Không tìm thấy User với ID: {dto.UserId}");

            if (!examExists)
                throw new ArgumentException($"Không tìm thấy Exam với ID: {dto.ExamId}");

            var userExam = new UserExam
            {
                UserId = dto.UserId,
                ExamId = dto.ExamId,
                Status= "Completed",
                FinishedTime = 85,
                OverallScore = 85, 
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.UserExams.Add(userExam);
            await _context.SaveChangesAsync();

            return userExam;
        }
        //post
        public async Task<Guid> CreateQuestionTextAsync(PostQuestionTextRequestDto request)
        {
            var questionId = Guid.NewGuid();

            var question = new Question
            {
                Id = questionId,
                ExamId = request.ExamId,
                TypeQuestion = "1", // Dạng điền từ
                Content = "default content"
            };

            var questionText = new QuestionText
            {
                Id = questionId,
                TextQuestion = request.TextQuestion,
                CorrectAnswer = request.CorrectAnswer,
                CorrectImg = request.CorrectImg
            };

            _context.Questions.Add(question);
            _context.QuestionText.Add(questionText);
            await _context.SaveChangesAsync();

            return questionId;
        }
        // post img
        public async Task<Guid> CreateQuestionImageAsync(PostQuestionImageRequestDto request)
        {
            var questionId = Guid.NewGuid();

            var question = new Question
            {
                Id = questionId,
                ExamId = request.ExamId,
                TypeQuestion = "2", // Dạng hình ảnh
                Content = "default content"
            };

            var questionImage = new QuestionImage
            {
                Id = questionId,
                QuestionImagesText = request.QuestionImagesText,
                CorrectImg = request.CorrectImg,
                WrongImg1 = request.WrongImg1,
                WrongImg2 = request.WrongImg2
            };

            _context.Questions.Add(question);
            _context.QuestionImages.Add(questionImage);
            await _context.SaveChangesAsync();

            return questionId;
        }


    }
}