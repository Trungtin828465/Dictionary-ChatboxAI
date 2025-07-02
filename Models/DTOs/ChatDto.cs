namespace DotnetAPIProject.Models.DTOs
{
    public class ChatDto
    {
        public Guid UserId { get; set; }
    }

    public class DetailChatDto
    {
        public string Role { get; set; }
        public string Content { get; set; }
        public Guid? ChatId { get; set; }
        public Guid? UserId { get; set; }
    }
}
