using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DotnetAPIProject.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnswerController : ControllerBase
{
    private readonly IAnswerService _answerService;

    public AnswerController(IAnswerService answerService)
    {
        _answerService = answerService;
    }

    [HttpPost]
    [Route("{questionId}/answers")]
    public async Task<ActionResult<Answer>> CreateAnswer(
        [FromRoute] string questionId,
        [FromBody] AnswerCreate createContent)
    {
        if (string.IsNullOrWhiteSpace(questionId) || !Guid.TryParse(questionId, out _))
        {
            return BadRequest("Invalid questionId.");
        }
        if (createContent == null)
        {
            return BadRequest("Invalid data.");
        }

        try
        {
            var createdAnswer = await _answerService.CreateAnswerAsync(Guid.Parse(questionId), createContent);
            if (createdAnswer == null)
            {
                return BadRequest("Failed to create answer.");
            }
            return createdAnswer;
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            // Log exception (not shown here)
            return StatusCode(500, $"An error occurred while creating the answer: {ex.Message}");
        }
    }
}