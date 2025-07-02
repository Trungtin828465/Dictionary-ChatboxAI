using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Data;


namespace DotnetAPIProject.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class AnswerReadingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnswerReadingController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpPost("add")]
        public async Task<IActionResult> AddAnswersReading([FromBody] AnswersReading answersReading)
        {
            try
            {
                var pdf = await _context.PdfDocuments.FindAsync(answersReading.IdPdf);
                if (pdf == null)
                {
                    return NotFound($"PdfDocument with ID {answersReading.IdPdf} not found.");
                }

                if (answersReading.CreatedDate == default)
                {
                    answersReading.CreatedDate = DateTime.UtcNow;
                }

                _context.AnswersReading.Add(answersReading);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Answers added successfully", testId = answersReading.TestId });
            }
            catch (DbUpdateException dbEx)
            {
                return StatusCode(500, $"Database Update Error: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected Error: {ex.Message}");
            }
        }

        // Placeholder for GetTestAnswer (ensure this exists or adjust the CreatedAtAction)
        [HttpGet("{id}")]
        public async Task<ActionResult<AnswersReading>> GetTestAnswer(int id)
        {
            var testAnswer = await _context.AnswersReading.FindAsync(id);

            if (testAnswer == null)
                return NotFound();

            return Ok(testAnswer);
        }
        // Cập nhật đáp án bài kiểm tra
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTestAnswer(int id, [FromBody] AnswersReading updatedTestAnswer)
        {
            if (updatedTestAnswer == null || id != updatedTestAnswer.TestId)
                return BadRequest("Invalid test data");

            var existingTest = await _context.AnswersReading.FindAsync(id);
            if (existingTest == null)
                return NotFound("Test not found");

            // Cập nhật các trường cần thiết
            existingTest.TestTitle = updatedTestAnswer.TestTitle;
            existingTest.CorrectAnswers = updatedTestAnswer.CorrectAnswers;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool TestAnswerExists(int id)
        {
            return _context.AnswersReading.Any(e => e.TestId == id);
        }
    }
}
