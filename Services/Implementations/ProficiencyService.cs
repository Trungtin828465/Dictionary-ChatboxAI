using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace DotnetAPIProject.Services.Implementations
{
    public class ProficiencyService : IProficiencyService
    {
        private readonly ApplicationDbContext _context;

        public ProficiencyService(ApplicationDbContext context)
        {
            _context = context;
        }
        // add
        public async Task<ProficiencyResponseDto> CreateProficiencyAsync(CreateProficiencyDto dto)
        {
            var entity = new Proficiency
            {
                Id = Guid.NewGuid(),
                Band = dto.Band,
                Name = dto.Name,
                Description = dto.Description,
                Skill = dto.Skill ?? string.Empty
            };

            _context.Proficiencies.Add(entity);
            await _context.SaveChangesAsync();

            return new ProficiencyResponseDto
            {
                Id = entity.Id,
                Band = entity.Band,
                Name = entity.Name,
                Description = entity.Description,
                Skill = entity.Skill ?? string.Empty
            };
        }

        // Get all proficiencies and map to ProficiencyResponseDto
        public async Task<List<ProficiencyResponseDto>> GetAllAsync()
        {
            // Get all proficiencies and map to ProficiencyResponseDto
            var proficiencyList = await _context.Proficiencies.ToListAsync();
            if (proficiencyList == null || !proficiencyList.Any())
            {
                return new List<ProficiencyResponseDto>();
            }

            return await _context.Proficiencies
                .Select(p => new ProficiencyResponseDto
                {
                    Id = p.Id,
                    Band = p.Band,
                    Name = p.Name,
                    Skill = p.Skill,
                    Description = p.Description
                }).ToListAsync();
        }

        public async Task<List<ProficiencyResponseDto>> GetProficienciesBySkillAsync(string skill)
        {
            var proficiencies = await _context.Proficiencies
                .Where(p => p.Skill.Contains(skill))
                .ToListAsync();
            if (proficiencies == null || !proficiencies.Any())
            {
                return null;
            }

            return proficiencies.Select(p => new ProficiencyResponseDto
            {
                Id = p.Id,
                Band = p.Band,
                Name = p.Name,
                Description = p.Description,
                Skill = p.Skill
            }).ToList();
        }

        public async Task<Proficiency> GetProficiencyByIdAsync(Guid proficiencyId)
        {
            var proficiency = await _context.Proficiencies.FindAsync(proficiencyId);
            if (proficiency == null)
            {
                throw new Exception("Proficiency not found");
            }
            return proficiency;
        }
        public async Task<List<ProficiencyResponseDto>> GetAllReading()
        {
            var proficiencyList = await _context.Proficiencies
            // Retrieve all proficiencies and map to ProficiencyResponseDto in a single query
          .Where(p => p.Skill == "Reading") // Filter by Listening
        .Select(p => new ProficiencyResponseDto
        {
            Id = p.Id,
            Band = p.Band,
            Name = p.Name,
            Skill = p.Skill,
            Description = p.Description ?? string.Empty
        })
        .ToListAsync();

            return proficiencyList;
        }

    }
}
