using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using WebHQTCSDL.Models;
using WebHQTCSDL.Models;

namespace WebHQTCSDL.Repositories
{
    public class RouteRepository
    {
        private readonly string _connectionString;

        // Constructor tự động lấy chuỗi kết nối từ appsettings.json
        public RouteRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbContext");
        }

        public async Task<IEnumerable<RouteDto>> GetDistinctRoutesAsync()
        {
            var routes = new List<RouteDto>();

            // Tạo kết nối tới Oracle
            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (var command = connection.CreateCommand())
                {
                    // Lệnh SQL của bạn
                    command.CommandText = "SELECT TuyenXeId, TenTuyen, DiemDi, DiemDen, KhoangCach_Km FROM TUYENXE ORDER BY TuyenXeId ASC"; command.CommandType = CommandType.Text;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            routes.Add(new RouteDto
                            {
                                // Anh xa chinh xac ten cot tu Oracle sang C#
                                TuyenXeId = reader["TUYENXEID"].ToString(),
                                TenTuyen = reader["TENTUYEN"].ToString(),
                                DiemDi = reader["DIEMDI"].ToString(),
                                DiemDen = reader["DIEMDEN"].ToString(),
                                // Kiem tra null truoc khi convert cho an toan
                                KhoangCach = reader["KHOANGCACH_KM"] != DBNull.Value ? Convert.ToDecimal(reader["KHOANGCACH_KM"]) : 0
                            });
                        }
                    }
                }
            }
            return routes;
        }
    }
}