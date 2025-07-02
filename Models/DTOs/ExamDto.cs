using System.ComponentModel.DataAnnotations;

namespace DotnetAPIProject.Models.DTOs
{
    public class ExamDto
    {
        public Guid IdExam { get; set; }
        public string NameExam { get; set; }
        public TopicDto Topic { get; set; }
        public double Time { get; set; }
        public string Skill { get; set; }
    }

    public class CreateExamDto
    {
        public string NameExam { get; set; }
        public Guid TopicID { get; set; }
        public int Time { get; set; } // thời gian thi
        public string Skill { get; set; }
    }

    // Have answer which no have correct
    public class ListeningExamHaveAnswerResponseDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public double? Time { get; set; }
        public required string Skill { get; set; }
        public TopicDto Topic { get; set; }
        public ListeningInforDto Infor { get; set; }
        public List<ListeningQuestionResponseDto> questions { get; set; } = new List<ListeningQuestionResponseDto>();
    }

    public class ListeningExamCreateDto
    {
        public string Name { get; set; }
        public Guid TopicId { get; set; }
        public int Time { get; set; }
        public string Skill { get; set; }
        public ListeningInforreateDto Infor { get; set; }
    }

    public class ListeningExamResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public TopicDto Topic { get; set; }
        public int Time { get; set; }
        public string Skill { get; set; }
        public int NumberOfQuestions { get; set; }
        public ListeningInforDto Infor { get; set; }
    }
}
