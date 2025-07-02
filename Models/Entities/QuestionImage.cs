using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    public class QuestionImage
    {
        [Key, ForeignKey("Question")]
        public Guid Id { get; set; }

        public string? QuestionImagesText { get; set; }
        public string? CorrectImg { get; set; }
        public string? WrongImg1 { get; set; }
        public string? WrongImg2 { get; set; }

        public virtual Question Question { get; set; }
    }

}
