﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using WebHQTCSDL.Models;
using WebHQTCSDL.Repositories;

namespace WebHQTCSDL.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthRepository _repository;
        private readonly IConfiguration _config;

        public AuthController(AuthRepository repository, IConfiguration config)
        {
            _repository = repository;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _repository.AuthenticateAsync(request.SoDienThoai, request.MatKhau);

                if (user == null)
                {
                    return Unauthorized(new { success = false, message = "Số điện thoại hoặc mật khẩu không đúng!" });
                }

                // Nếu đăng nhập đúng -> Tạo Token
                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Đăng nhập thành công!",
                    token = token,
                    user = user
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            try
            {
                string message = await _repository.RegisterAsync(req.HoTen, req.SoDienThoai, req.Email, req.MatKhau);
                return Ok(new { success = true, message = message });
            }
            catch (Exception ex)
            {
                // Bắt lỗi từ Oracle Trigger (Ví dụ: Lỗi số điện thoại hoặc lỗi trùng SĐT)
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // Hàm hỗ trợ tạo Token
        private string GenerateJwtToken(UserDto user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new System.Collections.Generic.List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId),
                new Claim("hoTen", user.HoTen)
            };

            // Đưa toàn bộ vai trò vào Token
            foreach (var role in user.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // Token sống 7 ngày
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}