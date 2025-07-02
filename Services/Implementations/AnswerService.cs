using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DotnetAPIProject.Services.Implementations;

public class AnswerService : IAnswerService
{
    private readonly ApplicationDbContext _context;

    public AnswerService(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public bool IsCorrectAnswer(Guid answerId)
    {
        if (answerId == Guid.Empty)
            return false;
        var answer = _context.Answers
            .AsNoTracking()
            .FirstOrDefault(a => a.Id == answerId);

        return answer?.IsCorrect ?? false;
    }
    
    public async Task<Models.DTOs.Answer> CreateAnswerAsync(Guid questionId, AnswerCreate answerCreate)
    {
        var entity = new Models.Entities.Answer
        {
            Id = Guid.NewGuid(),
            Symbol = answerCreate.Symbol ?? string.Empty,
            Description = answerCreate.Description ?? string.Empty,
            IsCorrect = answerCreate.IsCorrect ?? false,
            QuestionId = questionId
        };
        _context.Answers.Add(entity);
        await _context.SaveChangesAsync();
        return new Models.DTOs.Answer
        {
            Id = entity.Id,
            Symbol = entity.Symbol,
            Description = entity.Description,
            IsCorrect = entity.IsCorrect
        };
    }

    public async Task<List<AnswerResponseDto>> GetAnswersByQuestionIdAsync(Guid questionId, bool? includeCorrect = false)
    {
        var answers = await _context.Answers
            .AsNoTracking()
            .Where(x => x.QuestionId == questionId)
            .Select(x => new AnswerResponseDto
            {
                Id = x.Id,
                Symbol = x.Symbol,
                Description = x.Description,
                IsCorrect = includeCorrect == true ? x.IsCorrect : null
            })
            .ToListAsync();
        
        Console.WriteLine($"Retrieved {includeCorrect} {answers[0].IsCorrect}");
        return answers;
    }

    public async Task<bool> DeleteAnswerAsync(Guid id)
    {
        var entity = await _context.Answers.FindAsync(id);
        if (entity == null)
            return false;
        _context.Answers.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Models.DTOs.Answer> UpdateAnswerAsync(Guid id, AnswerUpdate update)
    {
        var entity = await _context.Answers.FindAsync(id);
        if (entity == null)
            throw new Exception("Answer not found.");

        if (update.Symbol != null)
            entity.Symbol = update.Symbol;
        if (update.Description != null)
            entity.Description = update.Description;
        if (update.IsCorrect.HasValue)
            entity.IsCorrect = update.IsCorrect.Value;

        await _context.SaveChangesAsync();

        return new Models.DTOs.Answer
        {
            Id = entity.Id,
            Symbol = entity.Symbol,
            Description = entity.Description,
            IsCorrect = entity.IsCorrect
        };
    }
}