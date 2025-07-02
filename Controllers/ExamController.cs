using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Services.Implementations;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DotnetAPIProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly IExamsService _examService;
        private readonly IProficiencyService _proficiencyService;

        public ExamController(IExamsService examService, IProficiencyService proficiencyService)
        {
            _examService = examService;
            _proficiencyService = proficiencyService;
        }

        // GET: api/Exam?topicId={guid}
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExamDto>>> GetExams([FromQuery] Guid? topicId = null)
        {
            try
            {
                var exams = await _examService.GetExamAsync(topicId);

                if (exams == null || !exams.Any())
                {
                    return NotFound("No exams found.");
                }

                return Ok(exams);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving exams.");
            }
        }
        // lấy
        [HttpPost]
        public async Task<IActionResult> CreateExam([FromBody] CreateExamDto examDto)
        {
            try
            {
                var result = await _examService.CreateExamAsync(examDto);
                if (result == null)
                {
                    return BadRequest("Failed to create exam.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the exam.");
            }
        }

        [HttpGet("listening/{examId}")]
        public async Task<ActionResult<ListeningExamHaveAnswerResponseDto>> GetDetailListeningExamByIdAsync([FromRoute] Guid examId)
        {
            try
            {
                var exam = await _examService.GetDetailListeningExamByIdAsync(examId);
                if (exam == null)
                {
                    return NotFound("Listening exam not found.");
                }
                return Ok(exam);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("listening")]
        public async Task<IActionResult> CreateListeningExam([FromBody] ListeningExamCreateDto listeningExamDto)
        {
            try
            {
                var result = await _examService.CreateListeningExamAsync(listeningExamDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("listenings")]
        public async Task<ActionResult<IEnumerable<ListeningExamResponseDto>>> GetListeningExam([FromQuery] Guid proficiencyId)
        {
            try
            {
                var proficiency = await _proficiencyService.GetProficiencyByIdAsync(proficiencyId);
                if (proficiency == null)
                {
                    return NotFound("Proficiency not found.");
                }
                var result = await _examService.GetListeningExamByProficiencyIdAsync(proficiencyId);
                if (result == null || !result.Any())
                {
                    return Ok(new List<ListeningExamResponseDto>());
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{examId}")]
        public async Task<IActionResult> DeleteExam([FromRoute] Guid examId)
        {
            try
            {
                var result = await _examService.DeleteExamByIdAsync(examId);
                if (result)
                {
                    return Ok("Exam deleted successfully.");
                }
                return BadRequest("Failed to delete exam.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
