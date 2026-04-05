using System;
using System.Collections.Generic;

namespace WebHQTCSDL.Models
{
    public class CancelLogDto
    {
        public string LogId { get; set; }
        public string VeId { get; set; }
        public string DonHangId { get; set; }
        public string MaGhe { get; set; }
        public DateTime ThoiGianHuy { get; set; }
        public string NguoiHuy { get; set; }
    }

    public class ExchangeLogDto
    {
        public string MaDoiVe { get; set; }
        public string KhachHangId { get; set; }
        public string VeCuId { get; set; }
        public string VeMoiId { get; set; }
        public decimal TienHoan { get; set; }
        public decimal TienThuThem { get; set; }
        public DateTime ThoiGian { get; set; }
    }

    public class AuditLogsResponse
    {
        public List<CancelLogDto> CancelLogs { get; set; } = new List<CancelLogDto>();
        public List<ExchangeLogDto> ExchangeLogs { get; set; } = new List<ExchangeLogDto>();
    }
}