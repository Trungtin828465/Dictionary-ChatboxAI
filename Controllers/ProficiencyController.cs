using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DotnetAPIProject.Controllers
{
    [Route("api/[controller]")]
    public class ProficiencyController : ControllerBase
    {
        private readonly IProficiencyService _proficiencyService;

        public ProficiencyController(IProficiencyService proficiencyService)
        {
            _proficiencyService = proficiencyService;
        }

        [HttpGet("Proficiency")]
        public async Task<ActionResult> GetLevel()
        {
            try
            {
                var proficiencies = await _proficiencyService.GetAllAsync();
                if (!proficiencies.Any())
                {
                    return NotFound("No proficiencies found with Skill 'Listening'.");
                }
                return Ok(proficiencies);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving proficiencies: {ex}");
                return StatusCode(500, $"Lỗi khi lấy danh sách band: {ex.Message}");
            }
        }
        [HttpGet("Proficiency-raeding")]
        public async Task<ActionResult> GetLevelReading()
        {
            try
            {
                var proficiencies = await _proficiencyService.GetAllReading();
                if (!proficiencies.Any())
                {
                    return NotFound("No proficiencies found with Skill 'Listening'.");
                }
                return Ok(proficiencies);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving proficiencies: {ex}");
                return StatusCode(500, $"Lỗi khi lấy danh sách band: {ex.Message}");
            }
        }
        // add

        [HttpPost("Proficiency")]
        public async Task<IActionResult> Create([FromBody] CreateProficiencyDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var created = await _proficiencyService.CreateProficiencyAsync(dto);
                return CreatedAtAction(nameof(GetById), new { idProficiency = created.Id }, created);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        [HttpGet("Proficiency/skill")]
        public async Task<ActionResult<IEnumerable<ProficiencyResponseDto>>> GetProficienciesBySkill([FromQuery] string skill)
        {
            var proficiencies = await _proficiencyService.GetProficienciesBySkillAsync(skill);
            if (proficiencies == null || !proficiencies.Any())
            {
                return Ok(new List<ProficiencyResponseDto>());
            }
            return Ok(proficiencies);
        }


        [HttpGet("{idProficiency}")]
        public async Task<IActionResult> GetById(Guid idProficiency)
        {
            var all = await _proficiencyService.GetAllAsync();
            var one = all.FirstOrDefault(x => x.Id == idProficiency);
            if (one == null) return NotFound();
            return Ok(one);
        }


    }
}
