using DotnetAPIProject.Models.DTOs;

namespace DotnetAPIProject.Services.Interfaces
{
    public interface IExamsService
    {
        
        Task<ExamDto> CreateExamAsync(CreateExamDto examDto);

        Task<ListeningExamResponseDto> CreateListeningExamAsync(ListeningExamCreateDto listeningExamDto);

        // Get all exams by topic id
        Task<IEnumerable<ExamDto>> GetExamAsync(Guid? topicId);

        // Get detail exam by id
        Task<ListeningExamHaveAnswerResponseDto> GetDetailListeningExamByIdAsync(Guid examId);

        //Get list of listening exam by proficiencyId
        Task<IEnumerable<ListeningExamResponseDto>> GetListeningExamByProficiencyIdAsync(Guid proficiencyId);

        //Delete exam by id 
        Task<bool> DeleteExamByIdAsync(Guid examId);
    }
}
