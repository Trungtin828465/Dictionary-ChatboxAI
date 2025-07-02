using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;

namespace DotnetAPIProject.Services.Interfaces;

public interface IDictionaryService
{
    Task<DictionaryItem> CreateAsync(DictionaryItemDto item);
    Task<IEnumerable<DictionaryItem>> GetAllAsync();
    Task<List<DictionaryItem>> GetByIdAsync(Guid id);
    Task<DictionaryItem?> UpdateAsync(Guid id, DictionaryItemDto item);
    Task<bool> DeleteAsync(Guid id);
    Task<string> GetWordDefinitionAsync(string word);
    Task<DictionaryItem?> UpdateLearningStatusAsync(Guid id, bool isLearned);
}