using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;

namespace DotnetAPIProject.Services.Interfaces
{
    public interface IAccountService
    {
        // TODO: Should be removed
        // Task<IEnumerable<Account>> GetAccountsAsync();

        Task<Account> AddAccountAsync(AccountDto account);
        Task<Account> HandleLoginAsync(string email, string password);
    }
}
