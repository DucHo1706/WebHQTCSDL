namespace WebHQTCSDL.Models
{
    public class AddRouteRequest
    {
        // Da xoa TuyenXeId
        public string TenTuyen { get; set; }
        public string DiemDi { get; set; }
        public string DiemDen { get; set; }
        public decimal KhoangCach { get; set; }
    }
}
