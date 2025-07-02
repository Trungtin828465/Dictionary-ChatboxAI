using DotnetAPIProject.Models.DTOs;

namespace DotnetAPIProject.Services.Interfaces
{
    public interface IListeningExamService
    {
        Task<ListeningInforDto> CreateListeningExamInforAsync(Guid examId, ListeningInforreateDto listeningExamDto);
    }
}
