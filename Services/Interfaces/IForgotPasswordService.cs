// using Azure.Core;
// using DotnetAPIProject.Models.Entities;

// namespace DotnetAPIProject.Services.Interfaces
// {
//     public interface IForgotPasswordService
//     {
//         Task<IEnumerable<ForgotPassword>> GetEmailOTPAsync();
//         Task<Account?> CheckEmailAsync(string email);

//         // Task<ForgotPassword?> CheckOTPAsync(string email,string OTP);
//         Task<bool> VerifyOtpAsync(string email, string otp); // Hàm kiểm tra OTP
//         Task<IEnumerable<Account>> ChangePasswordAsync(string Email, string Password);
//     }
// }
