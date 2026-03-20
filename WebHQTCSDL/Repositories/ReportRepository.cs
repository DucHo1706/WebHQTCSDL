using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using WebHQTCSDL.Models;

namespace WebHQTCSDL.Repositories
{
    public class ReportRepository
    {
        private readonly string _connectionString;

        public ReportRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbContext");
        }

        public async Task<ReportResultDto> GetRevenueReportAsync(DateTime tuNgay, DateTime denNgay)
        {
            var result = new ReportResultDto();

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_ThongKe_DoanhThu_Ngay";
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add("p_TuNgay", OracleDbType.TimeStamp).Value = tuNgay;
                    command.Parameters.Add("p_DenNgay", OracleDbType.TimeStamp).Value = denNgay;

                    var refCursor = new OracleParameter("p_RefCursor", OracleDbType.RefCursor) { Direction = ParameterDirection.Output };
                    command.Parameters.Add(refCursor);

                    var outTongTien = new OracleParameter("p_TongDoanhThu", OracleDbType.Decimal) { Direction = ParameterDirection.Output };
                    command.Parameters.Add(outTongTien);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.ChiTietTuyen.Add(new RevenueDetailDto
                            {
                                TenTuyen = reader["TENTUYEN"].ToString(),
                                SoVe = Convert.ToInt32(reader["SOVE"]),
                                DoanhThu = Convert.ToDecimal(reader["DOANHTHU"])
                            });
                        }
                    }

                    // Gắn tổng tiền
                    result.TongDoanhThu = ((OracleDecimal)outTongTien.Value).Value;
                }
            }
            return result;
        }
    }
}