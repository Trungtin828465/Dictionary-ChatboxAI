using System.ComponentModel.DataAnnotations;

namespace DotnetAPIProject.Models.DTOs
{
    public class UserExamDto
    {
        public Guid Id { get; set; }
        public double FinishedTime { get; set; }
        public required string Status { get; set; }
        public Guid ExamId { get; set; }
        public Guid UserId { get; set; }
        public List<DetailUserExamDto>? UserAnswers { get; set; }
    }

    public class UserExamCreateDto
    {
        public double FinishedTime { get; set; }
        public required string Status { get; set; }
        public Guid ExamId { get; set; }
        public Guid UserId { get; set; }
        public required List<DetailUserExamCreateDto> UserAnswers { get; set; }
    }

    public class UserExamUpdateDto
    {
        public double FinishedTime { get; set; }
        public required string Status { get; set; }
        public List<DetailUserExamUpdateDto>? UserAnswers { get; set; }
    }

    public class UserExamListeningResponseDto
    {
        public Guid Id { get; set; }
        public double FinishedTime { get; set; }
        public required string Status { get; set; }
        public required ListeningExamResponseDto ListeningExam { get; set; }
        public Guid UserId { get; set; }
        public required List<DetailListeningUserExamResponseDto> Result { get; set; }
    }
}