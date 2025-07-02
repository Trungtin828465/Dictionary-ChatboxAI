namespace DotnetAPIProject.Models.DTOs
{
    public class ReviewResultDto
    {
        public int QuestionNumber { get; set; }
        public string CorrectAnswer { get; set; }
        public string UserAnswer { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class TestReviewDataDto
    {
        public string TestTitle { get; set; }
        public int TotalQuestions { get; set; }
        public int PdfId { get; set; }
        public float TimeTakenSeconds { get; set; } // Added this property
        public List<ReviewResultDto> Results { get; set; }
    }
}
