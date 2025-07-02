
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Models.DTOs;


using Newtonsoft.Json;

using DotnetAPIProject.Data;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; // Added for ClaimTypes

namespace DotnetAPIProject.Controllers
{
    [Route("api/user/[controller]")]
    [ApiController]
    public class UserAnswerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserAnswerController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class SubmitAnswersRequest
        {
            public List<string> UserAnswers { get; set; }
            public int TimeTakenSeconds { get; set; }
        }

        [HttpPost("submit/{testId}")]
        public async Task<ActionResult<AnswerCheckResponseDto>> SubmitAnswers(int testId, [FromBody] SubmitAnswerRequest request)
        {
            // Lấy đáp án đúng
            var testAnswer = await _context.AnswersReading
                .FirstOrDefaultAsync(t => t.IdPdf == testId);
            if (testAnswer == null)
            {
                return NotFound("Test not found");
            }

            // Kiểm tra PDF
            var pdfDoc = await _context.PdfDocuments.FindAsync(testAnswer.IdPdf);
            if (pdfDoc == null)
            {
                return BadRequest("Invalid PDF document reference");
            }

            // Parse đáp án đúng
            var correctAnswersList = JsonConvert.DeserializeObject<List<string>>(testAnswer.CorrectAnswersJson);
            if (correctAnswersList == null)
            {
                return BadRequest("Invalid correct answers format");
            }

            var correctAnswers = new Dictionary<int, string>();
            for (int i = 0; i < correctAnswersList.Count; i++)
            {
                correctAnswers[101 + i] = correctAnswersList[i];
            }

            int totalQuestions = correctAnswers.Count;

            // Xử lý câu trả lời: nếu thiếu thì điền ""
            var paddedAnswers = request.UserAnswers ?? new List<string>();
            while (paddedAnswers.Count < totalQuestions)
            {
                paddedAnswers.Add("");
            }

            int correctCount = 0;
            var details = new List<AnswerDetailDto>();

            for (int i = 0; i < totalQuestions; i++)
            {
                int questionId = 101 + i;
                string selectedAnswer = paddedAnswers[i]?.Trim();
                string correctAnswer = correctAnswers[questionId]?.Trim();

                bool isCorrect = string.Equals(selectedAnswer, correctAnswer, StringComparison.OrdinalIgnoreCase);

                if (isCorrect) correctCount++;

                details.Add(new AnswerDetailDto
                {
                    QuestionNumber = questionId,
                    UserAnswer = selectedAnswer,
                    CorrectAnswer = correctAnswer,
                    IsCorrect = isCorrect
                });
            }

            double score = (double)correctCount / totalQuestions * 100;

            // Tính thời gian làm bài
            int timeTakenSeconds = 0;
            if (request.StartTime != default && request.StartTime < DateTime.UtcNow)
            {
                timeTakenSeconds = (int)(DateTime.UtcNow - request.StartTime).TotalSeconds;
            }

            // Lưu kết quả
            var submission = new UserSubmit
            {
                TestId = testAnswer.TestId,
                AccountId = request.AccountId,
                IdPdf = testId,
                ExamId = pdfDoc.ExamId,
                SubmissionDate = DateTime.UtcNow,
                CorrectCount = correctCount,
                Score = score,
                UserAnswers = JsonConvert.SerializeObject(paddedAnswers),
                TimeTakenSeconds = timeTakenSeconds
            };

            _context.UserSubmit.Add(submission);
            await _context.SaveChangesAsync();

            var response = new AnswerCheckResponseDto
            {
                TotalQuestions = totalQuestions,
                CorrectAnswers = correctCount,
                WrongAnswers = totalQuestions - correctCount,
                Score = score,
                Details = details,
                TestTitle = testAnswer.TestTitle,
                SubmissionId = submission.Id,
                TimeTakenSeconds = timeTakenSeconds,
                AccountId = submission.AccountId // Thêm AccountId vào phản hồi
            };

            return Ok(response);
        }

        [HttpGet("result/{submissionId}")]
        public async Task<ActionResult<AnswerCheckResponseDto>> GetResult(int submissionId)
        {
            try
            {
                var submission = await _context.UserSubmit
     .Include(s => s.AnswersReading)
     .Include(s => s.PdfDocument)
     .Include(s => s.Exam) // Include trực tiếp Exam
     .FirstOrDefaultAsync(s => s.Id == submissionId);


                if (submission == null || submission.AnswersReading == null || submission.PdfDocument == null)
                {
                    return NotFound($"Không tìm thấy bài nộp với ID {submissionId}.");
                }

                if (submission.Exam == null || submission.Exam.Skill.ToLower() != "reading")

                {
                    return BadRequest($"Bài nộp với ID {submissionId} không thuộc bài thi Reading.");
                }

                // Deserialize user answers
                List<string> userAnswers;
                try
                {
                    userAnswers = string.IsNullOrEmpty(submission.UserAnswers)
      ? new List<string>()
      : System.Text.Json.JsonSerializer.Deserialize<List<string>>(submission.UserAnswers);

                }
                catch
                {
                    return StatusCode(500, "Dữ liệu câu trả lời người dùng không hợp lệ.");
                }

                var correctAnswers = submission.AnswersReading.CorrectAnswers;
                if (correctAnswers == null || !correctAnswers.Any())
                {
                    return BadRequest("Dữ liệu đáp án đúng không hợp lệ.");
                }

                int totalQuestions = correctAnswers.Count;

                // Padding nếu người dùng làm thiếu
                while (userAnswers.Count < totalQuestions)
                {
                    userAnswers.Add("");
                }

                // So sánh câu trả lời
                int correctCount = 0;
                var details = new List<AnswerDetailDto>();

                for (int i = 0; i < totalQuestions; i++)
                {
                    string selectedAnswer = userAnswers[i]?.Trim();
                    string correctAnswer = correctAnswers[i]?.Trim();

                    bool isCorrect = string.Equals(selectedAnswer, correctAnswer, StringComparison.OrdinalIgnoreCase);
                    if (isCorrect) correctCount++;

                    details.Add(new AnswerDetailDto
                    {
                        QuestionNumber = 101 + i,
                        UserAnswer = selectedAnswer,
                        CorrectAnswer = correctAnswer,
                        IsCorrect = isCorrect
                    });
                }

                double score = (double)correctCount / totalQuestions * 100;

                return Ok(new AnswerCheckResponseDto
                {
                    TestTitle = submission.AnswersReading.TestTitle,
                    TotalQuestions = totalQuestions,
                    CorrectAnswers = correctCount,
                    WrongAnswers = totalQuestions - correctCount,
                    Score = score,
                    Details = details,
                    SubmissionId = submission.Id,
                    TimeTakenSeconds = submission.TimeTakenSeconds
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi lấy kết quả cho submission ID {submissionId}: {ex}");
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }
        [HttpGet("reading/info/{pdfId}")]
        public async Task<IActionResult> GetReadingTestInfo(int pdfId)
        {
            // Tìm bản ghi đề Reading dựa vào IdPdf
            var readingAnswer = await _context.AnswersReading
                .FirstOrDefaultAsync(ar => ar.IdPdf == pdfId);

            if (readingAnswer == null)
            {
                return NotFound("Không tìm thấy đề Reading với IdPdf này.");
            }

            var correctAnswers = readingAnswer.CorrectAnswers;

            return Ok(new
            {
                readingAnswer.IdPdf,
                readingAnswer.TestTitle,
                TotalQuestions = correctAnswers?.Count ?? 0
            });
        }

        [HttpGet("review/{submissionId}")]
        public IActionResult GetReviewResult(int submissionId)
        {
            var submission = _context.UserSubmit
                .Include(s => s.AnswersReading)
                .FirstOrDefault(s => s.Id == submissionId);

            if (submission == null)
                return NotFound();

            var correctAnswers = submission.AnswersReading.CorrectAnswers; // List<string>
            List<string> userAnswers;
            try
            {
                userAnswers = string.IsNullOrEmpty(submission.UserAnswers)
                    ? new List<string>()
                    : System.Text.Json.JsonSerializer.Deserialize<List<string>>(submission.UserAnswers);
            }
            catch (System.Text.Json.JsonException)
            {
                return BadRequest("Invalid JSON format for user answers.");
            }

            var results = new List<ReviewResultDto>();

            for (int i = 0; i < correctAnswers.Count; i++)
            {
                results.Add(new ReviewResultDto
                {
                    QuestionNumber = i + 1,
                    CorrectAnswer = correctAnswers[i],
                    UserAnswer = i < userAnswers.Count ? userAnswers[i] : "",
                    IsCorrect = i < userAnswers.Count && userAnswers[i] == correctAnswers[i]
                });
            }

            var response = new TestReviewDataDto
            {
                TestTitle = submission.AnswersReading.TestTitle,
                TotalQuestions = correctAnswers.Count,
                PdfId = submission.IdPdf,
                TimeTakenSeconds = submission.TimeTakenSeconds, // Added this line
                Results = results
            };

            return Ok(response);
        }
    }
}