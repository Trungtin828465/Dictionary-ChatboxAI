using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Implementations;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DotnetAPIProject.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        // TODO: Should be removed
        // [HttpGet]
        // public async Task<ActionResult<IEnumerable<Account>>> GetAccounts()
        // {
        //     var accounts = await _accountService.GetAccountsAsync();
        //     return Ok(accounts);
        // }

        [HttpPost]
        public async Task<IActionResult> CreateAccount([FromBody] AccountDto accountDto)
        {
            try
            {
                // Gọi Service để thêm tài khoản
                var account = await _accountService.AddAccountAsync(accountDto);
                // nếu tạo thành công
                return CreatedAtAction(nameof(CreateAccount), new { id = account.Id }, account);
            }
            catch (ArgumentException ex)
            {
                // báo lỗi ở service
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống!", error = ex.Message });
            }
        }

        [HttpPost("Login")]
        public async Task<IActionResult> HandleLogin([FromBody] AccountLoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var account = await _accountService.HandleLoginAsync(
                    loginDto.Email,
                    loginDto.Password
                );

                return Ok(new { message = "Đăng nhập thành công", account });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new { message = "Lỗi hệ thống controller!", error = ex.Message }
                );
            }
        }
    }
}
