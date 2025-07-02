using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Azure;
using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace DotnetAPIProject.Services.Implementations;


public class ChatService : IChatService, IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;

    private List<object> _conversationHistory = new();
    private bool _disposed = false;

    public ChatService(ApplicationDbContext context, IHttpClientFactory httpClientFactory, IMemoryCache cache)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _httpClient = httpClientFactory.CreateClient("ChatClient");
        _cache = cache;
        
        _httpClient.BaseAddress = new Uri("https://openrouter.ai/api/v1/chat/completions");
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        _httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue(
                "Bearer", 
                Environment.GetEnvironmentVariable("OPENROUTER_API_KEY")
            );
    }

    public async Task<Chat> CreateChatAsync(ChatDto chat, string Content)
    {
        var newChat = new Chat
            {
                Id = Guid.NewGuid(),
                UserId = chat.UserId,
                Title = string.Join(" ", Content.Split(' ').Take(6)) + "...",
                CreatedAt = DateTime.UtcNow
            };

        await _context.Chats.AddAsync(newChat);
        await _context.SaveChangesAsync();
        return newChat;
    }

    public async Task<DetailChat> PostRequestChat(DetailChatDto request)
    {
        // Create new chat if needed
        if (!request.ChatId.HasValue)
        {
            if (!request.UserId.HasValue)
                throw new ArgumentNullException(nameof(request.UserId), "UserId không được để trống");

            var newChat = await CreateChatAsync(
                new ChatDto { UserId = request.UserId.Value },
                request.Content
            );
            request.ChatId = newChat.Id;
        }

        // Get AI response
        var response = await GetAiResponse(request.Content);

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Save user message
            await CreateDetailChatAsync(request);

            // Save AI response
            var responseDetail = new DetailChatDto
            {
                Content = response,
                Role = "Ai",
                ChatId = request.ChatId
            };
            var result = await CreateDetailChatAsync(responseDetail);

            await transaction.CommitAsync();
            return result;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<string> GetAiResponse(string content)
    {
        // Clear previous conversation history when starting new
        ClearConversationHistory();
        AddToConversationHistory("user", content);

        string cacheKey = GenerateCacheKey();
        if (_cache.TryGetValue(cacheKey, out string cachedResponse))
        {
            Console.WriteLine("Cache hit");
            return cachedResponse;
        }
        Console.WriteLine("Cache miss");

        var requestBody = CreateRequestBody();
        var response = await SendApiRequest(requestBody);

        if (response == null)
            return "Error: Unable to fetch response.";

        AddToConversationHistory("assistant", response);
        _cache.Set(cacheKey, response, TimeSpan.FromMinutes(5));

        return response;
    }

    private string GenerateCacheKey()
    {
        // Use the last message (current question) as part of the cache key
        var currentQuestion = _conversationHistory.LastOrDefault() as dynamic;
        if (currentQuestion == null) return "empty";
        
        return $"response:{currentQuestion.content.GetHashCode()}";
    }

    private void AddToConversationHistory(string role, string content)
    {
        _conversationHistory.Add(new { role, content });

        // Keep only the last 20 messages to limit memory usage
        if (_conversationHistory.Count > 20)
            _conversationHistory.RemoveAt(0);
    }

    private object CreateRequestBody()
    {
        return new
        {
            model = "google/gemma-3n-e4b-it:free",
            messages = _conversationHistory
        };
    }

    private async Task<string?> SendApiRequest(object requestBody)
    {
        var jsonContent = JsonSerializer.Serialize(requestBody);
        var response = await _httpClient.PostAsync(
            "https://openrouter.ai/api/v1/chat/completions", // Replace with actual API URL
            new StringContent(jsonContent, Encoding.UTF8, "application/json")
        );

        if (!response.IsSuccessStatusCode)
            return null;

        var responseContent = await response.Content.ReadAsStringAsync();
        var aiResponse = DeserializeApiResponse(responseContent);

        return aiResponse;
    }

    private string? DeserializeApiResponse(string jsonResponse)
    {
        try
        {
            var doc = JsonDocument.Parse(jsonResponse);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();
        }
        catch
        {
            return null;
        }
    }

    private void ClearConversationHistory()
    {
        _conversationHistory.Clear();
    }

    // private async Task<string> GetAiResponse(string content)
    // {
    //     string cacheKey = $"response:{content}";
    //     if (_cache.TryGetValue(cacheKey, out string cachedResponse))
    //         return cachedResponse;

    //     var requestBody = new
    //     {
    //         model = "google/gemini-2.0-flash-thinking-exp:free",
    //         messages = new[] { new { role = "user", content = content } }
    //     };

    //     var jsonContent = JsonSerializer.Serialize(requestBody);
    //     var response = await _httpClient.PostAsync(
    //         string.Empty,
    //         new StringContent(jsonContent, Encoding.UTF8, "application/json")
    //     );

    //     response.EnsureSuccessStatusCode();
    //     var responseContent = await response.Content.ReadAsStringAsync();

    //     using var doc = JsonDocument.Parse(responseContent);
    //     var result = doc.RootElement
    //         .GetProperty("choices")[0]
    //         .GetProperty("message")
    //         .GetProperty("content")
    //         .GetString();

    //     _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
    //     return result;
    // }



    // Other methods remain unchanged
    public Task<List<Chat>> GetChatsByUserIdAsync(Guid userId) => 
        _context.Chats
            .AsNoTracking()
            .Where(ch => ch.UserId == userId)
            .OrderByDescending(ch => ch.CreatedAt)
            .ToListAsync();

    public Task<List<DetailChat>> GetDetailChatByIdAsync(Guid chatId) =>
        _context.DetailChats
            .AsNoTracking()
            .Where(dc => dc.ChatId == chatId)
            .ToListAsync();

    public async Task<bool> DeleteChatAsync(Guid chatId)
    {
        var chat = await _context.Chats
            .FirstOrDefaultAsync(c => c.Id == chatId);
            
        if (chat == null) return false;

        _context.Chats.Remove(chat);
        await DeleteDetailChatAsync(chatId);
        await _context.SaveChangesAsync();
        return true;
    }

    public Task<bool> DeleteDetailChatAsync(Guid chatId) =>
        _context.DetailChats
            .Where(dc => dc.ChatId == chatId)
            .ExecuteDeleteAsync()
            .ContinueWith(t => t.Result > 0);

    public async Task<DetailChat> CreateDetailChatAsync(DetailChatDto detail)
    {
        var newDetailChat = new DetailChat
        {
            Role = detail.Role,
            Content = detail.Content,
            ChatId = detail.ChatId ?? Guid.Empty,
            CreatedAt = DateTime.UtcNow
        };

        await _context.DetailChats.AddAsync(newDetailChat);
        await _context.SaveChangesAsync();
        return newDetailChat;
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _httpClient?.Dispose();
            _disposed = true;
        }
    }
}