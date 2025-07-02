namespace DotnetAPIProject.Models.Entities;

public class Workspace
{
    public Guid Id { get; set; }
    public required Guid UserId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
}

public class WorkspaceResponse : Workspace
{
    public int WordCount { get; set; }
}
