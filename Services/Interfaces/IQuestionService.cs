using DotnetAPIProject.Models.DTOs;

namespace DotnetAPIProject.Services.Interfaces;

public interface IQuestionService
{
    Task<QuestionNoAnswerDto> CreateQuestionAsync(QuestionCreate createContent);
    Task<ListeningQuestionResponseDto> CreateListeningQuestionAsync(ListeningQuestionCreate createContent);
    Task<IEnumerable<QuestionNoAnswerDto>> GetAllQuestionsByExamIdAsync(Guid examId);
    Task<List<ListeningQuestionResponseDto>> GetAllListeningQuestionsByExamIdAsync(Guid examId);
    Task<ListeningQuestionResponseDto> GetDetailListeningQuestionByIdAsync(Guid id);
    Task<QuestionHaveAnswerDto> GetQuestionByIdAsync(Guid id);
}
