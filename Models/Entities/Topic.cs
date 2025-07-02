using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("Topics")]
    public class Topic
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        // [Required]
        [MaxLength(100)]
        public string? Name { get; set; } = string.Empty;

        [Required]
        public Guid ProficienciesId { get; set; }

        [ForeignKey("ProficienciesId")]
        public virtual Proficiency Proficiency { get; set; }
        public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    }
} 