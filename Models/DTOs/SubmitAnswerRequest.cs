namespace DotnetAPIProject.Models.DTOs
{
    public class SubmitAnswerRequest
    {
        public Guid AccountId { get; set; }
        public List<string> UserAnswers { get; set; }
        public int TimeTakenSeconds { get; set; }
        public DateTime StartTime { get; set; }
    }

}
