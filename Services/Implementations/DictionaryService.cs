using System.Net.Http;
using System.Text.Json;
using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Google.Cloud.Translation.V2;

namespace DotnetAPIProject.Services.Implementations;

public class DictionaryService : IDictionaryService
{
    private readonly ApplicationDbContext _context;
    private readonly string _baseUrl;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly TranslationClient _translationClient;

    public DictionaryService(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _baseUrl = Environment.GetEnvironmentVariable("OXFORD_DICTIONARY_BASE_URL") ?? "dummy";
        
        // Set the Google Application Credentials path to the correct location
        var credentialsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "gg_credential.json");
        credentialsPath = Path.GetFullPath(credentialsPath);
        
        if (File.Exists(credentialsPath))
        {
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
        }
        else
        {
            // Fallback: try the current directory
            var fallbackPath = "gg_credential.json";
            if (File.Exists(fallbackPath))
            {
                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", Path.GetFullPath(fallbackPath));
            }
        }
        
        _translationClient = TranslationClient.Create();
    }

    private async Task<string> TranslateToVietnameseAsync(string text)
    {
        try
        {
            var response = await _translationClient.TranslateTextAsync(
                text: text,
                targetLanguage: "vi",
                sourceLanguage: "en"
            );
            return response.TranslatedText;
        }
        catch (Exception ex)
        {
            throw new HttpRequestException($"Error calling Google Translate API: {ex.Message}");
        }
    }

    public async Task<DictionaryItem> CreateAsync(DictionaryItemDto item)
    {
        var dictionaryItem = new DictionaryItem
        {
            Word = item.Word,
            Definition = item.Definition,
            WorkspaceId = item.WorkspaceId,
            type = item.type,
            pronunciation = item.pronunciation,
            meaning = item.meaning,
            VietnameseMeaning = await TranslateToVietnameseAsync(item.Word)
        };

        _context.DictionaryItems.Add(dictionaryItem);
        await _context.SaveChangesAsync();
        return dictionaryItem;
    }

    public async Task<IEnumerable<DictionaryItem>> GetAllAsync()
    {
        return await _context.DictionaryItems.ToListAsync();
    }

    public async Task<List<DictionaryItem>> GetByIdAsync(Guid id)
    {
        return await _context.DictionaryItems
            .Where(d => d.WorkspaceId == id)
            .ToListAsync();
    }


    public async Task<DictionaryItem?> UpdateAsync(Guid id, DictionaryItemDto item)
    {
        var existingItem = await _context.DictionaryItems.FindAsync(id);

        if (existingItem == null)
            return null;

        existingItem.Word = item.Word;
        existingItem.Definition = item.Definition;
        existingItem.WorkspaceId = item.WorkspaceId;
        existingItem.type = item.type;
        existingItem.pronunciation = item.pronunciation;
        existingItem.meaning = item.meaning;

        await _context.SaveChangesAsync();
        return existingItem;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var item = await _context.DictionaryItems.FindAsync(id);
        if (item == null)
            return false;

        _context.DictionaryItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<DictionaryItem?> UpdateLearningStatusAsync(Guid id, bool isLearned)
    {
        var item = await _context.DictionaryItems.FindAsync(id);
        if (item == null)
            return null;

        item.isLearned = isLearned;
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<string> GetWordDefinitionAsync(string word)
    {
        using var httpClient = _httpClientFactory.CreateClient();
        var url = $"{_baseUrl}/entries/en/{word.ToLower()}";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Error calling Oxford API: {response.StatusCode}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(jsonResponse);
        return doc.RootElement.ToString();
    }
}