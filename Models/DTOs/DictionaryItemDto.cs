using System.Text.Json.Serialization;

namespace DotnetAPIProject.Models.DTOs;

public class DictionaryItemDto
{
    public required string Word { get; set; }
    public required string Definition { get; set; }
    public Guid WorkspaceId { get; set; }
    public string type { get; set; }
    public string pronunciation { get; set; }
    public string meaning { get; set; }
    public string? VietnameseMeaning { get; set; }
    public bool isLearned { get; set; }
}

public class WordDefinitionDto
{
    public required string Word { get; set; }
}