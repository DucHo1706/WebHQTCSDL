using System;

namespace WebHQTCSDL.Models
{
    public class TripSearchDto
    {
        public string ChuyenXeId { get; set; }
        public string TenTuyen { get; set; }
        public DateTime ThoiGianXuatPhat { get; set; }
        public string TenLoai { get; set; }
        public int SoLuongGhe { get; set; }
        public int SoGheConTrong { get; set; }
        public decimal GiaVeCoBan { get; set; }
    }

    public class BookTicketRequest
    {
        // Sẽ lấy UserId từ Token khi gọi API, nhưng ở đây có thể truyền lên tạm để test
        public string UserId { get; set; }
        public string ChuyenXeId { get; set; }
        public string MaGhe { get; set; }
    }
}