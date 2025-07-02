using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Implementations;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DotnetAPIProject.Controllers
{
    [Route("api/[controller]")] // Đường dẫn: /api/quesion
    [ApiController] // Đánh dấu đây là API Controller
    public class QuestionPictureController : ControllerBase
    {
        private readonly IQuestionPictureService _quesionService;
                         
        public QuestionPictureController(IQuestionPictureService quesionService)
        {
            _quesionService = quesionService;
        }
        [HttpGet("QuestionTextImg")]
        public async Task<ActionResult<IEnumerable<QuestionPictureDto>>> GetQuestions([FromQuery] Guid questionSetId)
        {
            try
            {
                var questions = await _quesionService.GetQuestionsAsync(questionSetId);
                if (questions == null || !questions.Any())
                {
                    return NotFound("No questions found for the specified question set.");
                }
                return Ok(questions);
            }
            catch (Exception ex)
            {
                // Ghi log chi tiết
                Console.WriteLine($"Error retrieving questions: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, "aAn error occurred while retrieving questions.");
            }
        }
        // history
        [HttpGet("UserExam")]
        public async Task<ActionResult<IEnumerable<UserExam>>> GetResultUserExam()
        {
            var his = await _quesionService.GetResultUserExamAsync();
            return Ok(his);
        }
        [HttpPost]
        public async Task<IActionResult> CreateUserExam([FromBody] CreateUserExamHistoryDto dto)
        {
            try
            {
                var result = await _quesionService.CreateUserExamHistoryAsync(dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", detail = ex.Message });
            }
        }
        // post text
        [HttpPost("text")]
        public async Task<IActionResult> PostQuestionText([FromBody] PostQuestionTextRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var questionId = await _quesionService.CreateQuestionTextAsync(request);

            return Ok(new
            {
                Message = "Tạo câu hỏi dạng điền từ thành công!",
                QuestionId = questionId
            });
        }
        // post img 
        [HttpPost("image")]
        public async Task<IActionResult> PostQuestionImage([FromBody] PostQuestionImageRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var questionId = await _quesionService.CreateQuestionImageAsync(request);

            return Ok(new
            {
                Message = "Tạo câu hỏi dạng hình ảnh thành công!",
                QuestionId = questionId
            });
        }



    }
}
