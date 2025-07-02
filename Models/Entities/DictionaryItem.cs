using System.Text.Json.Serialization;

namespace DotnetAPIProject.Models.Entities;

public class DictionaryItem
{
    public Guid Id { get; set; }
    public required string Word { get; set; }
    public required string Definition { get; set; }
    public string type { get; set; }
    public string pronunciation { get; set; }
    public string meaning { get; set; }
    public string VietnameseMeaning { get; set; }
    public bool isLearned { get; set; } = false;

    public Guid WorkspaceId { get; set; }
}