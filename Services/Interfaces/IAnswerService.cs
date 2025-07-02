using System.Collections.Generic;
using DotnetAPIProject.Models.DTOs;

namespace DotnetAPIProject.Services.Interfaces
{
    public interface IAnswerService
    {
        Task<Answer> CreateAnswerAsync(Guid questionId,AnswerCreate answerCreate);
        Task<List<AnswerResponseDto>> GetAnswersByQuestionIdAsync(Guid questionId, bool? includeCorrect = false);
        Task<bool> DeleteAnswerAsync(Guid id);
        Task<Answer> UpdateAnswerAsync(Guid id, AnswerUpdate answerUpdate);
    }
}