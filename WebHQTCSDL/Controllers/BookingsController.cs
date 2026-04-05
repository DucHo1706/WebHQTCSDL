﻿using Microsoft.AspNetCore.Mvc;
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
        [HttpPost("pay")]
        public async Task<IActionResult> PayOrder([FromBody] PayRequest req)
        {
            try
            {
                string outMessage = await _repository.PayOrderAsync(req.DonHangId);
                
                if (outMessage.Contains("LỖI"))
                    return BadRequest(new { success = false, message = outMessage });

                return Ok(new { success = true, message = outMessage });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("exchange")]
        public async Task<IActionResult> ExchangeTicket([FromBody] ExchangeRequest req)
        {
            try
            {
                if (string.IsNullOrEmpty(req.VeCuId))
                {
                    return BadRequest(new { success = false, message = "Lỗi: Không tìm thấy Mã Vé Cũ! Vui lòng kiểm tra lại API /Admin/tickets xem đã trả về thuộc tính VeId chưa." });
                }

                string resultMessage = await _repository.ExchangeTicketAsync(req);

                if (resultMessage.Contains("LỖI") || resultMessage.Contains("lỗi"))
                {
                    return BadRequest(new { success = false, message = resultMessage });
                }

                return Ok(new { success = true, message = resultMessage });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi từ CSDL: " + ex.Message });
            }
        }
    }
}