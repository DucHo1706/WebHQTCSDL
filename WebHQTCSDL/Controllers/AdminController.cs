using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using WebHQTCSDL.Repositories;
using WebHQTCSDL.Models;

namespace WebHQTCSDL.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Chỉ Admin mới vào được
    public class AdminController : ControllerBase
    {
        private readonly AdminRepository _repository;

        public AdminController(AdminRepository repository)
        {
            _repository = repository;
        }

        [HttpPost("add-trip")]
        public async Task<IActionResult> AddTrip([FromBody] AddTripRequest req)
        {
            try
            {
                // Controller gọi Repository cực kỳ sạch sẽ
                string outMessage = await _repository.AddTripAsync(
                    req.TuyenXeId, req.XeId, req.ThoiGianXuatPhat, req.ThoiGianDuKienDen, req.GiaVeCoBan);

                // Nếu Procedure/Trigger của Oracle báo lỗi
                if (outMessage.Contains("LỖI"))
                {
                    return BadRequest(new { success = false, message = outMessage });
                }

                // Nếu thành công
                return Ok(new { success = true, message = outMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        [HttpGet("schedule")]
        public async Task<IActionResult> GetSchedule()
        {
            try
            {
                var data = await _repository.GetScheduleAsync();
                return Ok(new { success = true, data = data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}