using System.ComponentModel.DataAnnotations;

namespace DotnetAPIProject.Models.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Tên tài khoản không được để trống.")]
        public required string UserName { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự.")]
        public required string Password { get; set; }
    }
}
