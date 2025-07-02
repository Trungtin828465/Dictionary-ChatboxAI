using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DotnetAPIProject.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateChatAsync([FromBody] ChatDto chat)
        {
            if (chat.UserId == null)
            {
                return BadRequest("Dữ liệu không hợp lệ. Vui lòng cung cấp userId.");
            }

            var createdChat = await _chatService.CreateChatAsync(chat, "New chat");
            return Ok(createdChat);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetChatsByUserIdAsync(Guid userId)
        {
            var chatHistory = await _chatService.GetChatsByUserIdAsync(userId);

            if (chatHistory == null || chatHistory.Count == 0)
            {
                return NotFound("Không có lịch sử chat cho userId này.");
            }

            return Ok(chatHistory);
        }

        [HttpGet("detail/{chatId}")]
        public async Task<IActionResult> GetDetailChatByIdAsync(Guid chatId)
        {
            var chat = await _chatService.GetDetailChatByIdAsync(chatId);

            if (chat == null)
            {
                return NotFound("Không tìm thấy lịch sử chat.");
            }

            return Ok(chat);
        }

        [HttpDelete("{chatId}")] // localhost:8000/api/v1/chat/12183981273?userId=1
        public async Task<IActionResult> DeleteChatAsync(Guid chatId)
        {
            var deleted = await _chatService.DeleteChatAsync(chatId);
            if (!deleted)
            {
                return NotFound("Không tìm thấy lịch sử chat cần xóa.");
            }

            return NoContent();
        }

        [HttpPost("request")]
        public async Task<IActionResult> PostRequestChat(DetailChatDto request)
        {
            var response = await _chatService.PostRequestChat(request);
            return Ok(response);
        }
    }
}
