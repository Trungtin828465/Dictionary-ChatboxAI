namespace DotnetAPIProject.Models.DTOs
{
    public class AnswerCheckResponseDto
    {
        public string TestTitle { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int WrongAnswers { get; set; }
        public double Score { get; set; }
        public List<AnswerDetailDto> Details { get; set; }
        public int SubmissionId { get; set; }
        public int TimeTakenSeconds { get; set; }
        public Guid? AccountId { get; set; } // Thêm trường này

    }

    public class AnswerDetailDto
    {
        public int QuestionNumber { get; set; }
        public string UserAnswer { get; set; }
        public string CorrectAnswer { get; set; }
        public bool IsCorrect { get; set; }
    }
}
