using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DotnetAPIProject.Services.Implementations;

public class WorkspaceService : IWorkspaceService
{
    private readonly ApplicationDbContext _context;

    public WorkspaceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<WorkspaceResponse>> GetWorkspacesAsync(Guid userId)
    {
        var workspaces = await _context
            .Workspaces.Where(w => w.UserId == userId)
            .Select(w => new WorkspaceResponse
            {
                Id = w.Id,
                UserId = w.UserId,
                Name = w.Name,
                Description = w.Description,
                WordCount = _context.DictionaryItems.Count(di => di.WorkspaceId == w.Id),
            })
            .ToListAsync();

        return workspaces;
    }

    public async Task<Workspace> AddWorkspaceAsync(WorkspaceDto workspaceDto)
    {
        // Kiểm tra xem UserId có tồn tại trong database không
        var user = await _context.Accounts.FindAsync(workspaceDto.UserId);
        if (user == null)
        {
            throw new Exception("UserId không tồn tại");
        }

        // Kiểm tra xem workspace đã tồn tại name với UserId hay chưa
        var existingWorkspace = await _context.Workspaces.FirstOrDefaultAsync(w =>
            w.UserId == workspaceDto.UserId && w.Name == workspaceDto.Name
        );
        if (existingWorkspace != null)
        {
            throw new Exception("Workspace đã tồn tại");
        }

        var workspace = new Workspace
        {
            UserId = workspaceDto.UserId,
            Name = workspaceDto.Name,
            Description = workspaceDto.Description,
        };

        _context.Workspaces.Add(workspace);
        await _context.SaveChangesAsync();
        return workspace;
    }

    public async Task<Workspace?> UpdateWorkspaceAsync(Guid id, WorkspaceDto workspaceDto)
    {
        var workspace = await _context.Workspaces.FindAsync(id);
        if (workspace == null)
            return null;

        workspace.Name = workspaceDto.Name;
        workspace.Description = workspaceDto.Description;

        await _context.SaveChangesAsync();
        return workspace;
    }

    public async Task<Workspace?> DeleteWorkspaceAsync(Guid id)
    {
        var workspace = await _context.Workspaces.FindAsync(id);
        if (workspace == null)
            return null;
        _context.Workspaces.Remove(workspace);
        await _context.SaveChangesAsync();
        return workspace;
    }
}
