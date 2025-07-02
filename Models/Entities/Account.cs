using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotnetAPIProject.Models.Entities
{
    [Table("Accounts")]
    public class Account
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string NumberPhone { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;
    }
}
