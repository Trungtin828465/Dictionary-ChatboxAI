using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
        [Table("Proficiencies")]
        public class Proficiency
        {
                [Key]
                [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
                public Guid Id { get; set; }

                [MaxLength(20)]
                public string Band { get; set; } = string.Empty;

                [MaxLength(100)]
                public string Name { get; set; } = string.Empty;

                public string? Skill { get; set; } = string.Empty;

                public string Description { get; set; } = string.Empty;
                public ICollection<Topic> Topics { get; set; } = new List<Topic>();
        }
}
