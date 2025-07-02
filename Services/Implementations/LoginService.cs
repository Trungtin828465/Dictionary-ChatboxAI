// using DotnetAPIProject.Data;
// using DotnetAPIProject.Models.DTOs;
// using DotnetAPIProject.Models.Entities;
// using DotnetAPIProject.Services.Interfaces;
// using Microsoft.EntityFrameworkCore;

// namespace DotnetAPIProject.Services.Implementations
// {
//     public class LoginService : ILoginService
//     {
//         private readonly ApplicationDbContext _context;

//         public LoginService(ApplicationDbContext context)
//         {
//             _context = context;
//         }

//         // code
//         public async Task<IEnumerable<Account>> GetLoginAsync()
//         {
//             return await _context.Accounts.ToListAsync();
//         }

//         //public async Task<Account?> CheckLoginAsync(string userName, string password)
//         //{
//         //    var account = await _context.Accounts
//         //        .FirstOrDefaultAsync(a => a.UserName == userName);

//         //    if (account == null || account.Password != password)
//         //    {
//         //        return null;
//         //    }

//         //    return account;
//         //}
//         public async Task<Account> CheckLoginAsync(string userName, string password)
//         {
//             var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserName == userName);

//             if (account == null)
//             {
//                 throw new ArgumentException("Tên tài khoản không tồn tại!");
//             }

//             // Dùng BCrypt.Verify() để kiểm tra mật khẩu
//             if (!BCrypt.Net.BCrypt.Verify(password, account.Password))
//             {
//                 throw new ArgumentException("Sai mật khẩu!");
//             }

//             return account;
//         }

//         public Task<Account> CheckLoginAsync(string userName, AccountDto account)
//         {
//             throw new NotImplementedException();
//         }
//     }
// }
