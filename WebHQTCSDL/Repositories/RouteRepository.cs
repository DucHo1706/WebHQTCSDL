using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using WebHQTCSDL.Models;

namespace WebHQTCSDL.Repositories
{
    public class RouteRepository
    {
        private readonly string _connectionString;

        public RouteRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbContext");
        }

        public async Task<IEnumerable<RouteDto>> GetAllRoutesAsync()
        {
            var routes = new List<RouteDto>();
            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SELECT TuyenXeId, TenTuyen, DiemDi, DiemDen, KhoangCach_Km FROM TUYENXE";
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            routes.Add(new RouteDto
                            {
                                TuyenXeId = reader["TuyenXeId"].ToString(),
                                TenTuyen = reader["TenTuyen"].ToString(),
                                DiemDi = reader["DiemDi"].ToString(),
                                DiemDen = reader["DiemDen"].ToString(),
                                KhoangCach = Convert.ToInt32(reader["KhoangCach_Km"])
                            });
                        }
                    }
                }
            }
            return routes;
        }
    }
}