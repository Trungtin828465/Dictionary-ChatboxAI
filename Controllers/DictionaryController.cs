using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Implementations;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DotnetAPIProject.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DictionaryController : ControllerBase
{
    private readonly IDictionaryService _dictionaryService;

    public DictionaryController(IDictionaryService dictionaryService)
    {
        _dictionaryService = dictionaryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DictionaryItem>>> GetDictionary()
    {
        var dictionarys = await _dictionaryService.GetAllAsync();
        return Ok(dictionarys);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IEnumerable<DictionaryItem>>> GetByIdAsyncdictionary(Guid id)
    {
        var dictionarys = await _dictionaryService.GetByIdAsync(id);
        return Ok(dictionarys);
    }

    [HttpPost]
    public async Task<ActionResult<DictionaryItem>> CreateDictionary(
        DictionaryItemDto dictionaryDto
    )
    {
        var dictionnary = await _dictionaryService.CreateAsync(dictionaryDto);
        return CreatedAtAction(nameof(GetDictionary), new { id = dictionnary.Id }, dictionnary);
    }

    [HttpPost("word-definition")]
    public async Task<ActionResult<DictionaryItem>> GetWordDefinition(
        WordDefinitionDto wordDefinitionDto
    )
    {
        var word = wordDefinitionDto.Word;
        if (string.IsNullOrWhiteSpace(word))
            return BadRequest("Word cannot be empty.");

        try
        {
            var definition = await _dictionaryService.GetWordDefinitionAsync(word);
            return Ok(definition);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Error calling Oxford API: " + ex.Message
            );
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DictionaryItem>> UpdaUpdateAsync(
        Guid id,
        DictionaryItemDto dictionaryDto
    )
    {
        var dictionary = await _dictionaryService.UpdateAsync(id, dictionaryDto);
        return Ok(dictionary);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDictionary(Guid id)
    {
        var result = await _dictionaryService.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpPatch("{id}/learning-status")]
    public async Task<IActionResult> UpdateLearningStatus(Guid id, [FromBody] bool isLearned)
    {
        var result = await _dictionaryService.UpdateLearningStatusAsync(id, isLearned);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    // TODO: Implement the rest of the endpoints
    // GET /api/v1/dictionary/{id}
    // PUT /api/v1/dictionary/{id}
    // DELETE /api/v1/dictionary/{id}
}