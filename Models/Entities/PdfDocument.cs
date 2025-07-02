namespace DotnetAPIProject.Models.Entities
{
    public class PdfDocument
    {
        public int Id { get; set; }
        public string? FileName { get; set; }
        public string? Content { get; set; }
        public DateTime UploadDate { get; set; }
        public int? FileSize { get; set; }
        public byte[]? FileData { get; set; }

        // Foreign key
        public Guid ExamId { get; set; }

        // Navigation properties
        public Exam Exam { get; set; }
        public ICollection<AnswersReading> AnswersReading { get; set; }
        public ICollection<UserSubmit> UserSubmits { get; set; }
    }
}
