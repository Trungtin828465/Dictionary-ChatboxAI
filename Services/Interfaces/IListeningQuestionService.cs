using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;

namespace DotnetAPIProject.Services.Interfaces
{
     public interface IListeningQuestion
    {
        Task<ListeningQuestionInforDto> CreateListeningQuestionAsync(Guid questionId, ListeningQuestionInforCreateDto listeningQuestionDto);

        //delete listening question by id
        Task<bool> DeleteListeningQuestionByIdAsync(Guid questionId);
    }
}