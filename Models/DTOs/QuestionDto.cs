namespace DotnetAPIProject.Models.DTOs
{
    public class QuestionHaveAnswerDto
    {
        public Guid Id { get; set; }
        public required string Content { get; set; } = string.Empty;
        public required string TypeQuestion { get; set; } = string.Empty;
        public required List<AnswerResponseDto> Options { get; set; } = new List<AnswerResponseDto>();
    }

    public class QuestionNoAnswerDto
    {
        public Guid Id { get; set; }
        public required string Content { get; set; } = string.Empty;
        public required string TypeQuestion { get; set; } = string.Empty;
    }

    public class QuestionCreate
    {
        public required string Content { get; set; } = string.Empty;
        public string TypeQuestion { get; set; } = string.Empty;
        public Guid ExamId { get; set; }
        public List<AnswerCreate> Options { get; set; } = new List<AnswerCreate>();
    }

    public class QuestionUpdate
    {
        public string? Content { get; set; } = string.Empty;
        public string? TypeQuestion { get; set; } = string.Empty;
        public List<AnswerUpdate> Options { get; set; } = new List<AnswerUpdate>();
    }


    public class ListeningQuestionCreate{
        public required string Content { get; set; } = string.Empty;
        public string TypeQuestion { get; set; } = string.Empty;
        public Guid ExamId { get; set; }
        public List<AnswerCreate> Options { get; set; } = new List<AnswerCreate>();
        public ListeningQuestionInforCreateDto Infor { get; set; } = new ListeningQuestionInforCreateDto();
    }

    public class ListeningQuestionResponseDto
    {
        public Guid Id { get; set; }
        public required string Content { get; set; } = string.Empty;
        public required string TypeQuestion { get; set; } = string.Empty;
        public required ListeningQuestionInforDto Infor { get; set; } = new ListeningQuestionInforDto();
        public required List<AnswerResponseDto> Options { get; set; } = new List<AnswerResponseDto>();
    }
}