using System.Collections.Generic;
using System.Threading.Tasks;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;

namespace DotnetAPIProject.Services.Interfaces
{
    public interface IChatService
    {
        Task<Chat> CreateChatAsync(ChatDto chat, string initialContent);
        Task<List<Chat>> GetChatsByUserIdAsync(Guid userId);
        Task<List<DetailChat>> GetDetailChatByIdAsync(Guid chatId);
        Task<bool> DeleteChatAsync(Guid chatId);
        Task<DetailChat> PostRequestChat(DetailChatDto request);
    }
}
