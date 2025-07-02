using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("Exams")]
    public class Exam
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

         [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        // [Required]
        public Guid TopicId { get; set; }

        // [Required]
        public double? Time { get; set; }

        // [Required]
        [MaxLength(50)]
        public string? Skill { get; set; } = string.Empty;

        // [Required]
        public DateTime? CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("TopicId")]
        public virtual Topic Topic { get; set; }
        public ICollection<PdfDocument> PdfDocuments { get; set; } = new List<PdfDocument>();
    }
}