using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("ListeningExams")]
    public class ListeningExam
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        public string? Transcript { get; set; } = string.Empty;

        [Required]
        public required string AudioUrl { get; set; } 

        public string? ImageUrl { get; set; }

        [Required]
        public required string Direction { get; set; }

        [ForeignKey("ExamId")]
        public required Guid ExamId { get; set; }
    }
}