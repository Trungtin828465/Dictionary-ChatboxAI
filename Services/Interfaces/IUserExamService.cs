using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
namespace DotnetAPIProject.Services.Interfaces
{
    public interface IUserExamService
    {
        Task<UserExam> CheckUserExamExistsAsync(Guid userId, Guid examId);
        Task<List<UserExam>> GetAllListeningUserExamAsync(Guid userId);
        Task<UserExamDto> CreateListeningUserExamAsync(UserExamCreateDto createDto);
        Task<UserExamListeningResponseDto> GetListeningUserExamByIdAsync(Guid id);
        Task<UserExamDto> UpdateUserExamAsync(Guid userExamId, UserExamUpdateDto updateDto);
        Task<bool> DeleteUserExamAsync(Guid userExamId);
    }
}
