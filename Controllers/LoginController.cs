// using DotnetAPIProject.Models.DTOs;
// using DotnetAPIProject.Models.Entities;
// using DotnetAPIProject.Services.Implementations;
// using DotnetAPIProject.Services.Interfaces;
// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Mvc;

// namespace DotnetAPIProject.Controllers
// {
//     [Route("api/[controller]")]
//     [ApiController]
//     public class LoginController : ControllerBase
//     {
//         private readonly ILoginService _iLoginService;

//         public LoginController(ILoginService iLoginService)
//         {
//             _iLoginService = iLoginService;
//         }

//         [HttpGet]
//         public async Task<ActionResult<IEnumerable<Account>>> GetLogin()
//         {
//             var login = await _iLoginService.GetLoginAsync();
//             return Ok(login);
//         }

//         [HttpPost("Login")]
//         public async Task<IActionResult> CheckLogin([FromBody] LoginDto loginDto)
//         {
//             try
//             {
//                 if (!ModelState.IsValid)
//                 {
//                     return BadRequest(ModelState);
//                 }

//                 var account = await _iLoginService.CheckLoginAsync(
//                     loginDto.UserName,
//                     loginDto.Password
//                 );

//                 return Ok(new { message = "Đăng nhập thành công", account });
//             }
//             catch (ArgumentException ex)
//             {
//                 return BadRequest(new { message = ex.Message });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(
//                     500,
//                     new { message = "Lỗi hệ thống controller!", error = ex.Message }
//                 );
//             }
//         }
//     }
// }
