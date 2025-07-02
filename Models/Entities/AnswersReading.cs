using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
//using Newtonsoft.Json; 
using System.Collections.Generic;
namespace DotnetAPIProject.Models.Entities
{
    public class AnswersReading
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TestId { get; set; }

        [Required(ErrorMessage = "Test title is required")]
        [StringLength(100, ErrorMessage = "Test title cannot exceed 100 characters")]
        public string TestTitle { get; set; }

        [Required(ErrorMessage = "Correct answers are required")]
        public string CorrectAnswersJson { get; set; }

        [NotMapped]
        public List<string> CorrectAnswers
        {
            get => string.IsNullOrEmpty(CorrectAnswersJson)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(CorrectAnswersJson);
            set => CorrectAnswersJson = JsonSerializer.Serialize(value);
        }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Range(1, int.MaxValue, ErrorMessage = "IdPdf must be greater than 0")]
        public int IdPdf { get; set; }

        [ForeignKey("IdPdf")]
        public PdfDocument? PdfDocument { get; set; }
        public ICollection<UserSubmit> UserSubmits { get; set; } = new List<UserSubmit>();
    }
}
