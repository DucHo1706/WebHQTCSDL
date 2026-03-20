namespace WebHQTCSDL.Models
{
    public class AddTripRequest
    {
        public string TuyenXeId { get; set; }
        public string XeId { get; set; }
        public DateTime ThoiGianXuatPhat { get; set; }
        public DateTime ThoiGianDuKienDen { get; set; }
        public decimal GiaVeCoBan { get; set; }
    }
}
