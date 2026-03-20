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
                    command.CommandText = "SELECT DISTINCT DiemDi, DiemDen FROM TUYENXE";
                    command.CommandType = CommandType.Text;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            routes.Add(new RouteDto
                            {
                                // GetString(0) là cột đầu tiên (DiemDi), GetString(1) là DiemDen
                                DiemDi = reader.GetString(0),
                                DiemDen = reader.GetString(1)
                            });
                        }
                    }
                }
            }
            return routes;
        }
    }
}