﻿using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WebHQTCSDL.Models;
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
        public async Task<IActionResult> SearchTrips([FromQuery] string? diemDi, [FromQuery] string? diemDen, [FromQuery] string? ngay)
        {
            try
            {
                // Cắt bỏ khoảng trắng dư thừa (nếu có)
                diemDi = diemDi?.Trim();
                diemDen = diemDen?.Trim();

                DateTime? ngayKhachChon = null;
                if (!string.IsNullOrEmpty(ngay) && DateTime.TryParse(ngay, out DateTime parsedDate))
                {
                    ngayKhachChon = parsedDate;
                }

                var trips = await _repository.SearchTripsAsync(diemDi, diemDen, ngayKhachChon);
                return Ok(new { success = true, data = trips });
            }
            catch (Exception ex)
            {
                Console.WriteLine("LỖI TÌM CHUYẾN: " + ex.Message);
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi tìm chuyến xe!" });
            }
        }

        [HttpGet("{id}/seats")]
        public async Task<IActionResult> GetBookedSeats(string id)
        {
            try
            {
                var seats = await _repository.GetBookedSeatsAsync(id);
                return Ok(new { success = true, data = seats });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi lấy danh sách ghế: " + ex.Message });
            }
        }
    }
}