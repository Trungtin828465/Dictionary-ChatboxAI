using System.Collections.Generic;

namespace DotnetAPIProject.Models.DTOs;

public class WorkspaceDto
{
    public required Guid UserId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
}
