using System.ComponentModel.DataAnnotations;

namespace DotnetAPIProject.Models.DTOs
{
    public class CheckEmailDto
    {
        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public required string Email { get; set; }
    }
}
