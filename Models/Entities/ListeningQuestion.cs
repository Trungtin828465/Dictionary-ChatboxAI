using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("ListeningQuestions")]
    public class ListeningQuestion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        public string? ImageUrl { get; set; }

        public string? DescriptionResult { get; set; }

        [ForeignKey("QuestionId")]
        public required Guid QuestionId { get; set; }
    }
}