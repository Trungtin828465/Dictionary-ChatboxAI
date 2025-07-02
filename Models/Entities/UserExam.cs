using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("UserExam")]
    public class UserExam
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        // [Required]
        public double? FinishedTime { get; set; }    

        public double? OverallScore { get; set; }

        // [Required]
        public  string? Status { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public Guid UserId { get; set; }

        [ForeignKey("ExamId")]
        public Guid ExamId { get; set; }
    }
}
