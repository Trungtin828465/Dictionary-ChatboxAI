using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DotnetAPIProject.Services.Implementations;

public class ListeningQuestionService : IListeningQuestion
{
    private readonly ApplicationDbContext _context;

    public ListeningQuestionService(
        ApplicationDbContext context,
        IAnswerService answerService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<ListeningQuestionInforDto> CreateListeningQuestionAsync(Guid questionId, ListeningQuestionInforCreateDto listeningQuestionDto)
    {
       try{
            var question = await _context.Questions.FindAsync(questionId);
            if (question == null)
                throw new Exception("Question not found");

            var listeningQuestion = new ListeningQuestion
            {
                Id = Guid.NewGuid(),
                ImageUrl = listeningQuestionDto.ImageUrl ?? string.Empty,
                DescriptionResult = listeningQuestionDto.DescriptionResult ?? string.Empty,
                QuestionId = questionId,
            };

            await _context.ListeningQuestions.AddAsync(listeningQuestion);
            await _context.SaveChangesAsync();

            return new ListeningQuestionInforDto
            {
                ImageUrl = listeningQuestion.ImageUrl,
                DescriptionResult = listeningQuestion.DescriptionResult,
            };
       }
       catch(Exception ex){
        throw new Exception(ex.Message);
       }
    }

    public async Task<bool> DeleteListeningQuestionByIdAsync(Guid questionId)
    {
        try{
            //Get list listening question by question id
            var listeningQuestions = await _context.ListeningQuestions.Where(x => x.QuestionId == questionId).ToListAsync();

            if (listeningQuestions == null)
                throw new Exception("Listening question not found");

            foreach (var listeningQuestion in listeningQuestions)
            {
                _context.ListeningQuestions.Remove(listeningQuestion);
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
        catch(Exception ex){
            throw new Exception(ex.Message);
        }
    }
    
}   