using DotnetAPIProject.Models.DTOs;

namespace DotnetAPIProject.Services.Interfaces
{
    public interface IDetailUserExamService
    {
        Task<DetailUserExamDto> CreateDetailUserExamAsync(Guid userExamId,string status, DetailUserExamCreateDto createDto);
        Task<DetailUserExamDto> UpdateDetailUserExamAsync(Guid userExamId,Guid questionId, DetailUserExamUpdateDto updateDto);
        Task<List<DetailListeningUserExamResponseDto>> GetAllDetailUserExamByUserExamIdAsync(Guid userExamId);
        Task<bool> DeleteAllDetailUserExamByUserExamIdAsync(Guid userExamId);
    }
}