using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("Answer")]
    public class Answer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string Symbol { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "NVARCHAR(MAX)")]
        public string Description { get; set; } = string.Empty;

        [Required]
        public bool IsCorrect { get; set; }

        [Required]
        public Guid QuestionId { get; set; }

        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; }
    }
} 