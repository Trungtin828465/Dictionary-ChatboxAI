using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Services.Implementations;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Validations;

namespace DotnetAPIProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserExamController : ControllerBase
    {
        private readonly IUserExamService _userExamService;

        public UserExamController(IUserExamService userExamService)
        {
            _userExamService = userExamService;
        }

        //Get all user exam by user id
        [HttpGet]
        [Route("listening")]
        public async Task<IActionResult> GetAllListeningUserExamAsync([FromQuery] Guid userId)
        {
            try
            {
                var userExams = await _userExamService.GetAllListeningUserExamAsync(userId);
                if (userExams == null || !userExams.Any())
                {
                    return Ok(new List<UserExamDto>());
                }

                return Ok(userExams);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Create user exam

        // make route to /UserExam/listening

        [HttpPost]
        [Route("listening")]
        public async Task<IActionResult> CreateListeningUserExamAsync([FromBody] UserExamCreateDto userExamDto)
        {
            try
            {
                // Check if the user exam already exists
                var existingUserExam = await _userExamService.CheckUserExamExistsAsync(userExamDto.UserId, userExamDto.ExamId);
                if (existingUserExam == null)
                {
                    var createdUserExam = await _userExamService.CreateListeningUserExamAsync(userExamDto);
                    if (createdUserExam == null)
                    {
                        return BadRequest("Failed to create user exam.");
                    }
                    return Ok(createdUserExam);
                }
                else
                {
                    await _userExamService.DeleteUserExamAsync(existingUserExam.Id);
                    var createdUserExam = await _userExamService.CreateListeningUserExamAsync(userExamDto);
                    if (createdUserExam == null)
                    {
                        return BadRequest("Failed to create user exam after deleting the existing one.");
                    }
                    return Ok(createdUserExam);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Get listening user exam by id
        [HttpGet]
        [Route("listening/{id}")]
        public async Task<IActionResult> GetListeningUserExamByIdAsync([FromRoute] Guid id)
        {
            try
            {
                var userExam = await _userExamService.GetListeningUserExamByIdAsync(id);
                return Ok(userExam);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}