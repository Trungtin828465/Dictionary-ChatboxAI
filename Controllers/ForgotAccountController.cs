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
//     public class ForgotAccountController : ControllerBase
//     {
//         private readonly IForgotPasswordService _forgotPasswordService;

//         public ForgotAccountController(IForgotPasswordService forgotPasswordService)
//         {
//             _forgotPasswordService = forgotPasswordService;
//         }

//         [HttpGet]
//         public async Task<ActionResult<IEnumerable<ForgotPassword>>> GetPassword()
//         {
//             var accounts = await _forgotPasswordService.GetEmailOTPAsync();
//             return Ok(accounts);
//         }

//         [HttpPost("check-email")]
//         public async Task<IActionResult> SendOtp([FromBody] CheckEmailDto request)
//         {
//             try
//             {
//                 var result = await _forgotPasswordService.CheckEmailAsync(request.Email);
//                 return Ok(new { message = "Mã OTP đã được gửi đến email của bạn." });
//             }
//             catch (ArgumentException ex)
//             {
//                 return BadRequest(new { message = ex.Message });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(
//                     500,
//                     new { message = "Lỗi hệ thống SendOTP!", error = ex.Message }
//                 );
//             }
//         }

//         [HttpPost("check-otp")]
//         public async Task<IActionResult> VerifyOtp([FromBody] ForgotPasswordDto request)
//         {
//             try
//             {
//                 var isValid = await _forgotPasswordService.VerifyOtpAsync(
//                     request.Email,
//                     request.OTP
//                 );

//                 if (!isValid)
//                 {
//                     return BadRequest(new { message = "Mã OTP không hợp lệ!" });
//                 }

//                 return Ok(
//                     new { message = "Xác nhận OTP thành công. Bạn có thể đặt lại mật khẩu." }
//                 );
//             }
//             catch (ArgumentException ex)
//             {
//                 return BadRequest(new { message = ex.Message });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "Lỗi hệ thống!", error = ex.Message });
//             }
//         }
//     }
// }
