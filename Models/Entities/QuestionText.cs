using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DotnetAPIProject.Models.Entities
{
    public class QuestionText
    {
        [Key, ForeignKey("Question")]
        public Guid Id { get; set; } // Dùng Id là cả khóa chính và khóa ngoại

        public string? TextQuestion { get; set; }
        public string? CorrectAnswer { get; set; }
        public string? CorrectImg { get; set; }

        public virtual Question Question { get; set; }
    }

}
