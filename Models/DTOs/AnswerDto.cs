namespace DotnetAPIProject.Models.DTOs
{
    public class Answer
    {
        public Guid Id { get; set; }
        public required string Symbol { get; set; }
        public required string Description { get; set; }
        public bool IsCorrect { get; set; }
        
    }

    public class AnswerResponseDto
    {
        public Guid Id { get; set; }
        public required string Symbol { get; set; }
        public required string Description { get; set; }
        public bool? IsCorrect { get; set; }
    }

    public class AnswerCreate
    {
        public string? Symbol { get; set; }
        public string? Description { get; set; }
        public bool? IsCorrect { get; set; }
    }

    public class AnswerUpdate
    {
        public string? Symbol { get; set; }
        public string? Description { get; set; }
        public bool? IsCorrect { get; set; }
    }
}