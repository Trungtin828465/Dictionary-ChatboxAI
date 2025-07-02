using DotnetAPIProject.Data;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using DotnetAPIProject.Models.DTOs;

using Microsoft.EntityFrameworkCore;


namespace DotnetAPIProject.Services.Implementations
{
    public class TopicService : ITopicService
    {
        private readonly ApplicationDbContext _context;
        private readonly IProficiencyService _proficiencyService;

        public TopicService(ApplicationDbContext context, IProficiencyService proficiencyService)
        {
            _context = context;
            _proficiencyService = proficiencyService;
        }

        public async Task<TopicDto> CreateTopicAsync(CreateTopicDto dto)
        {
            var entity = new Topic
            {
                Id = Guid.NewGuid(),
                Name = dto.TopicName,
                ProficienciesId = dto.ProficiencyId
            };

            _context.Topics.Add(entity);
            await _context.SaveChangesAsync();

            var proficiency = await _proficiencyService.GetProficiencyByIdAsync(entity.ProficienciesId);

            var topicDto = new TopicDto
            {
                IdTopic = entity.Id,
                Name = entity.Name,
                Proficiency = new ProficiencyResponseDto
                {
                    Id = proficiency.Id,
                    Name = proficiency.Name,
                    Band = proficiency.Band,
                    Skill= proficiency.Skill,
                    Description = proficiency.Description
                }

            };
             return topicDto;
        }

        public async Task<IEnumerable<TopicResponseDto>> GetTopicsAsync(Guid ProficiencyId)
        {
            //Get topics by proficiency id
            var topics = await _context.Topics.Where(t => t.ProficienciesId == ProficiencyId).ToListAsync();
            if (topics == null)
                return null;

            //Convert to TopicResponseDto
            var topicResponseDtos = topics.Select(t => new TopicResponseDto
            {
                IdTopic = t.Id,
                Name = t.Name,
            });
            return topicResponseDtos;
        }

        public async Task<TopicDto> GetTopicByIdAsync(Guid topicId)
        {
            var topic = await _context.Topics.FindAsync(topicId);

            if (topic == null)
                return null;

            var proficiency = await _proficiencyService.GetProficiencyByIdAsync(topic.ProficienciesId);

            //Convert to TopicDto
            var topicDto = new TopicDto
            {
                IdTopic = topic.Id,
                Name = topic.Name,
                Proficiency = new ProficiencyResponseDto
                {
                    Id = proficiency.Id,
                    Name = proficiency.Name,
                    Band = proficiency.Band,
                    Skill =proficiency.Skill,
                    Description = proficiency.Description
                }
            };
            return topicDto;
        }

    }
}
