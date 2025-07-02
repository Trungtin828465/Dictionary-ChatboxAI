using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("Questions")]
    public class Question
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        // [Required]
        public string? Content { get; set; } = string.Empty;


        [ForeignKey("ExamId")]
        public  Guid? ExamId { get; set; }

        [Column(TypeName = "NVARCHAR(MAX)")]
        public string? TypeQuestion { get; set; } = string.Empty;
        public virtual QuestionText QuestionText { get; set; } // Quan hệ 1:1
        public virtual QuestionImage QuestionImages { get; set; } // 1:1
    }
} 