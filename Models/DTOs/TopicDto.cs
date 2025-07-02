namespace DotnetAPIProject.Models.DTOs
{
    public class TopicResponseDto
    {
        public Guid IdTopic { get; set; }              // sửa từ int -> Guid
        public string Name { get; set; }
    }

    public class TopicDto
    {
        public Guid IdTopic { get; set; }              // sửa từ int -> Guid
        public string Name { get; set; }
        public ProficiencyResponseDto Proficiency { get; set; }
    }

    public class CreateTopicDto
    {
        public string TopicName { get; set; }
        public Guid ProficiencyId { get; set; }
    }
}
