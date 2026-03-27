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
        public class UpdateStatusRequest
        {
            public string ChuyenXeId { get; set; }
            public string Action { get; set; } // "start", "complete", "cancel"
        }

        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateTripStatus([FromBody] UpdateStatusRequest req)
        {
            try
            {
                string outMessage = await _repository.UpdateTripStatusAsync(req.ChuyenXeId, req.Action);
                if (outMessage.Contains("LỖI"))
                    return BadRequest(new { success = false, message = outMessage });

                return Ok(new { success = true, message = outMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        [HttpGet("vehicles")]
        public async Task<IActionResult> GetVehicles()
        {
            try
            {
                var data = await _repository.GetVehiclesAsync();
                return Ok(new { success = true, data = data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Loi: " + ex.Message });
            }
        }
   

        [HttpPost("add-route")]
        public async Task<IActionResult> AddRoute([FromBody] AddRouteRequest req)
        {
            try
            {
                // Khong truyen tuyenXeId nua
                string outMessage = await _repository.AddRouteAsync(req.TenTuyen, req.DiemDi, req.DiemDen, req.KhoangCach);
                if (outMessage.Contains("LOI")) return BadRequest(new { success = false, message = outMessage });
                return Ok(new { success = true, message = outMessage });
            }
            catch (Exception ex) { return StatusCode(500, new { success = false, message = ex.Message }); }
        }

        [HttpPost("delete-route")]
        public async Task<IActionResult> DeleteRoute([FromBody] string tuyenXeId)
        {
            try
            {
                string outMessage = await _repository.DeleteRouteAsync(tuyenXeId);
                if (outMessage.Contains("LOI")) return BadRequest(new { success = false, message = outMessage });
                return Ok(new { success = true, message = outMessage });
            }
            catch (Exception ex) { return StatusCode(500, new { success = false, message = ex.Message }); }
        }
        [HttpGet("tickets")]
        public async Task<IActionResult> GetAllTickets()
        {
            try
            {
                var data = await _repository.GetAllTicketsAsync();
                return Ok(new { success = true, data = data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Loi: " + ex.Message });
            }
        }
    }
}