namespace WebHQTCSDL.Models
{
    public class ReportResultDto
    {
        public decimal TongDoanhThu { get; set; }
        public List<RevenueDetailDto> ChiTietTuyen { get; set; } = new List<RevenueDetailDto>();
    }
}
