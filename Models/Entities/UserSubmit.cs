using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    public class UserSubmit
    {
        public int Id { get; set; }

        // Foreign keys
        public int TestId { get; set; }
        public Guid? AccountId { get; set; }
        public int IdPdf { get; set; }
        public Guid ExamId { get; set; }
        public Guid? ResultUserExamId { get; set; }

        // Data
        public string UserAnswers { get; set; }
        public DateTime SubmissionDate { get; set; }
        public int CorrectCount { get; set; }
        public double Score { get; set; }
        public int TimeTakenSeconds { get; set; }
     

      
       


     
      
      
        [ForeignKey("IdPdf")]
        public PdfDocument? PdfDocument { get; set; }  // Assuming this entity exists
                                                       // Navigation properties
        [ForeignKey("TestId")]
        public AnswersReading AnswersReading { get; set; }
        [ForeignKey("ExamId")]
        public Exam Exam { get; set; }
        public Account Account { get; set; }
        public UserExam ResultUserExam { get; set; }
    }
}
