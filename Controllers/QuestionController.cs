using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DotnetAPIProject.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    [HttpPost]
    public async Task<ActionResult<QuestionNoAnswerDto>> CreateQuestion([FromBody] QuestionCreate createContent)
    {
        if (createContent == null)
        {
            return BadRequest("Invalid data.");
        }
        try
        {
            var createdQuestion = await _questionService.CreateQuestionAsync(createContent);
            if (createdQuestion == null)
            {
                return BadRequest("Failed to create question.");
            }
            return createdQuestion;
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            // Log exception (not shown here)
            return StatusCode(500, $"An error occurred while creating the question: {ex.Message}");
        }
    }

    [HttpGet("/QuestionsPicture/{examId}")]
    public async Task<ActionResult<IEnumerable<QuestionNoAnswerDto>>> GetAllQuestionsByExamId(Guid examId)
    {
        var questions = await _questionService.GetAllQuestionsByExamIdAsync(examId);
        if (questions == null)
        {
            return NotFound("No questions found for the given exam ID.");
        }
        return Ok(questions);
    }

    [HttpPost("listening")]
    public async Task<ActionResult<ListeningQuestionResponseDto>> CreateListeningQuestion([FromBody] ListeningQuestionCreate createContent)
    {
       try{
        var createdListeningQuestion = await _questionService.CreateListeningQuestionAsync(createContent);
        if (createdListeningQuestion == null)
        {
            return BadRequest("Failed to create listening question.");
        }
        return Ok(createdListeningQuestion);
       }
       catch(Exception ex){
        return StatusCode(500, $"An error occurred while creating the listening question: {ex.Message}");
       }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuestionHaveAnswerDto>> GetQuestionById(Guid id)
    {
        try{
            var question = await _questionService.GetQuestionByIdAsync(id); 
            if (question == null)
            {
                return NotFound("Question not found");
            }
            return Ok(question);
        }
        catch(Exception ex){
            return StatusCode(500, $"An error occurred while getting the question: {ex.Message}");
        }
    }
}