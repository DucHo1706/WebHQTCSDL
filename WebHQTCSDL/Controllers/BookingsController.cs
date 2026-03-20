using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebHQTCSDL.Models;
using WebHQTCSDL.Repositories;

namespace WebHQTCSDL.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingRepository _repository;

        public BookingsController(BookingRepository repository)
        {
            _repository = repository;
        }

        [HttpPost]
        public async Task<IActionResult> BookTicket([FromBody] BookingRequest request)
        {
            try
            {
                string resultMessage = await _repository.BookTicketAsync(request);

                // Dựa vào chữ "LỖI" mà Procedure của bạn trả ra để phân loại status code
                if (resultMessage.Contains("LỖI"))
                {
                    return BadRequest(new { success = false, message = resultMessage });
                }

                return Ok(new { success = true, message = resultMessage });
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine("LỖI: " + ex.Message);
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        [HttpPost("cancel")]
        public async Task<IActionResult> CancelOrder([FromBody] CancelRequest request)
        {
            try
            {
                // Gọi Repository để xử lý hủy đơn
                string resultMessage = await _repository.CancelOrderAsync(request.DonHangId);

                // Nếu Procedure Oracle báo LỖI
                if (resultMessage.Contains("LỖI"))
                {
                    return BadRequest(new { success = false, message = resultMessage });
                }

                // Nếu thành công (Trả về câu: Hủy đơn hàng thành công...)
                return Ok(new { success = true, message = resultMessage });
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine("LỖI: " + ex.Message);
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetBookingHistory(string userId)
        {
            try
            {
                var data = await _repository.GetBookingHistoryAsync(userId);
                return Ok(new { success = true, data = data });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}