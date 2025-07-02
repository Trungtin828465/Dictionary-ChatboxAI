using System.ComponentModel.DataAnnotations;

namespace DotnetAPIProject.Models.DTOs
{
    public class DetailUserExamDto
    {
        public Guid Id { get; set; }
        public Guid UserExamId { get; set; }
        public Guid QuestionId { get; set; }
        public Guid AnswerId { get; set; }
        public bool? IsCorrect { get; set; }
        public bool? IsMarked { get; set; }
    }

    public class DetailUserExamCreateDto
    {
        public Guid QuestionId { get; set; }
        public Guid AnswerId { get; set; }
        public bool? IsMarked { get; set; }
    }

    public class DetailUserExamUpdateDto
    {
        public Guid QuestionId { get; set; }
        public Guid AnswerId { get; set; }
        public bool? IsMarked { get; set; }
    }

    public class DetailListeningUserExamResponseDto
    {
        public required ListeningQuestionResponseDto Question { get; set; }
        public Guid AnswerId { get; set; }
        public bool IsCorrect { get; set; }
        public bool? IsMarked { get; set; }
    }
}