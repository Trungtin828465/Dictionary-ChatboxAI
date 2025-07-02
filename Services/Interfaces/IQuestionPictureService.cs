using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;

namespace DotnetAPIProject.Services.Interfaces
{
    public interface IQuestionPictureService
    {
        Task<IEnumerable<QuestionPictureDto>> GetQuestionsAsync(Guid questionSetId);
        Task<IEnumerable<UserExam>> GetResultUserExamAsync();
        Task<UserExam> CreateUserExamHistoryAsync(CreateUserExamHistoryDto dto);
        // post
        Task<Guid> CreateQuestionTextAsync(PostQuestionTextRequestDto request);
        Task<Guid> CreateQuestionImageAsync(PostQuestionImageRequestDto request);
    }
}