using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WebHQTCSDL.Repositories;

namespace WebHQTCSDL.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripsController : ControllerBase
    {
        private readonly TripRepository _repository;

        public TripsController(TripRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchTrips([FromQuery] string diemDi, [FromQuery] string diemDen, [FromQuery] DateTime ngayDi)
        {
            try
            {
                var trips = await _repository.SearchTripsAsync(diemDi, diemDen, ngayDi);
                return Ok(new { success = true, data = trips });
            }
            catch (Exception ex)
            {
                Console.WriteLine("LỖI: " + ex.Message);
                return StatusCode(500, new { success = false, message = "Lỗi khi tìm kiếm chuyến xe!" });
            }
        }
        [HttpGet("{chuyenXeId}/seats")]
        public async Task<IActionResult> GetBookedSeats(string chuyenXeId)
        {
            try
            {
                var seats = await _repository.GetBookedSeatsAsync(chuyenXeId);

                // Trả về mảng các ghế đã đặt (VD: ["A01", "A02", "B05"])
                return Ok(new { success = true, data = seats });
            }
            catch (Exception ex)
            {
                Console.WriteLine("LỖI: " + ex.Message);
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy sơ đồ ghế!" });
            }
        }
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedTrips()
        {
            try
            {
                var trips = await _repository.GetFeaturedTripsAsync();
                return Ok(new { success = true, data = trips });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống!" });
            }
        }
    }
}