using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
        [Table("DetailUserExam")]
        public class DetailUserExam
        {
                [Key]
                [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
                public Guid Id { get; set; }

                public bool? IsMarked { get; set; }

                [ForeignKey("ResultId")]
                public Guid UserExamId { get; set; }

                [ForeignKey("AnswerId")]
                public Guid AnswerId { get; set; }

                [ForeignKey("QuestionId")]
                public Guid QuestionId { get; set; }
        }
}