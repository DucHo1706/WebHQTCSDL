using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WebHQTCSDL.Repositories;

namespace WebHQTCSDL.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportRepository _repository;

        public ReportsController(ReportRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenue(DateTime tuNgay, DateTime denNgay)
        {
            try
            {
                var data = await _repository.GetRevenueReportAsync(tuNgay, denNgay);
                return Ok(new { success = true, data = data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}