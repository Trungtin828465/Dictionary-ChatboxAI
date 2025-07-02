using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;

namespace DotnetAPIProject.Services.Interfaces
{
        public interface IProficiencyService
        {
                Task<ProficiencyResponseDto> CreateProficiencyAsync(CreateProficiencyDto dto);
                Task<List<ProficiencyResponseDto>> GetAllAsync();
                Task<List<ProficiencyResponseDto>> GetAllReading();

                Task<List<ProficiencyResponseDto>> GetProficienciesBySkillAsync(string skill);
                Task<Proficiency> GetProficiencyByIdAsync(Guid proficiencyId);
                //Task<Proficiency> CreateProficiencyAsync(Proficiency proficiency); // Add this line

        }
}
