// using System.Net;
// using System.Net.Mail;
// using DotnetAPIProject.Data;
// using DotnetAPIProject.Models.Entities;
// using DotnetAPIProject.Services.Interfaces;
// using Microsoft.EntityFrameworkCore;
// using static System.Net.WebRequestMethods;

// namespace DotnetAPIProject.Services.Implementations
// {
//     public class ForgotPasswordService : IForgotPasswordService
//     {
//         private readonly ApplicationDbContext _context;

//         public ForgotPasswordService(ApplicationDbContext context)
//         {
//             _context = context;
//         }

//         public async Task<IEnumerable<ForgotPassword>> GetForgotPasswordsAsync()
//         {
//             return await _context.ForgotPasswords.ToListAsync();
//         }

//         public async Task<Account> CheckEmailAsync(string email)
//         {
//             var getEmail = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == email);
//             if (getEmail != null)
//             {
//                 var random = new Random();
//                 var otpCode = random.Next(100000, 999999).ToString();

//                 try
//                 {
//                     var smtpClient = new SmtpClient("smtp.gmail.com")
//                     {
//                         Port = 587, // Cổng SMTP của Gmail
//                         Credentials = new NetworkCredential(
//                             "watchstore4conga@gmail.com",
//                             "wfxx gjdt ucie kzdk"
//                         ),
//                         EnableSsl = true, // Bật SSL để bảo mật
//                     };

//                     var mailMessage = new MailMessage
//                     {
//                         From = new MailAddress("watchstore4conga@gmail.com"), // Địa chỉ email gửi
//                         Subject = "OTP đổi mật khẩu.",
//                         Body = "Mã OTP của bạn là: " + otpCode,
//                         IsBodyHtml = true,
//                     };
//                     mailMessage.To.Add(getEmail.Email);
//                     smtpClient.Send(mailMessage);
//                 }
//                 catch (Exception ex)
//                 {
//                     throw new ArgumentException("Lỗi trong quá trình gửi mật khẩu!");
//                 }

//                 var newOtp = new ForgotPassword { Email = getEmail.Email, OTP = otpCode };
//                 _context.ForgotPasswords.Add(newOtp);
//                 await _context.SaveChangesAsync(); // Lưu vào database

//                 return getEmail;
//             }
//             else
//             {
//                 throw new ArgumentException("Email không tồn tại trong hệ thống!");
//             }
//         }

//         public async Task<bool> VerifyOtpAsync(string email, string otp)
//         {
//             var otpRecord = await _context
//                 .ForgotPasswords.Where(f => f.Email == email)
//                 .OrderByDescending(f => f.OTP) // Lấy OTP mới nhất
//                 .FirstOrDefaultAsync();

//             if (otpRecord == null || otpRecord.OTP != otp)
//             {
//                 return false; // OTP không đúng hoặc không tồn tại
//             }

//             return true; // OTP hợp lệ
//         }

//         public async Task<IEnumerable<ForgotPassword>> GetEmailOTPAsync()
//         {
//             return await _context.ForgotPasswords.ToListAsync();
//         }

//         public Task<IEnumerable<Account>> ChangePasswordAsync(string Email, string Password)
//         {
//             throw new NotImplementedException();
//         }
//     }
// }
