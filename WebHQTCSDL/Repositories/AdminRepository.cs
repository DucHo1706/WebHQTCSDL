using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;

namespace WebHQTCSDL.Repositories
{
    public class AdminRepository
    {
        private readonly string _connectionString;

        public AdminRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbContext");
        }

        public async Task<string> AddTripAsync(string tuyenXeId, string xeId, DateTime thoiGianXuatPhat, DateTime thoiGianDuKienDen, decimal giaVeCoBan)
        {
            string outMessage = string.Empty;
            // Tự động sinh mã chuyến xe mới
            string newChuyenXeId = "CX-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_ThemChuyenXe";
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add("p_ChuyenXeId", OracleDbType.Varchar2).Value = newChuyenXeId;
                    command.Parameters.Add("p_TuyenXeId", OracleDbType.Varchar2).Value = tuyenXeId;
                    command.Parameters.Add("p_XeId", OracleDbType.Varchar2).Value = xeId;
                    command.Parameters.Add("p_ThoiGianXuatPhat", OracleDbType.TimeStamp).Value = thoiGianXuatPhat;
                    command.Parameters.Add("p_ThoiGianDuKienDen", OracleDbType.TimeStamp).Value = thoiGianDuKienDen;
                    command.Parameters.Add("p_GiaVeCoBan", OracleDbType.Decimal).Value = giaVeCoBan;

                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200);
                    outParam.Direction = ParameterDirection.Output;
                    command.Parameters.Add(outParam);

                    await command.ExecuteNonQueryAsync();

                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }
        public async Task<System.Collections.Generic.IEnumerable<Models.ScheduleDto>> GetScheduleAsync()
        {
            var list = new System.Collections.Generic.List<Models.ScheduleDto>();
            using (var conn = new OracleConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = conn.CreateCommand())
                {
                    // Truy vấn trực tiếp từ VIEW đã tạo
                    cmd.CommandText = "SELECT * FROM VW_LichTrinhXe";
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new Models.ScheduleDto
                            {
                                ChuyenXeId = reader["CHUYENXEID"].ToString(),
                                TenTuyen = reader["TENTUYEN"].ToString(),
                                XeId = reader["XEID"].ToString(),
                                ThoiGianXuatPhat = Convert.ToDateTime(reader["THOIGIANXUATPHAT"]),
                                ThoiGianDuKienDen = Convert.ToDateTime(reader["THOIGIANDUKIENDEN"]),
                                TrangThai = reader["TRANGTHAI"].ToString()
                            });
                        }
                    }
                }
            }
            return list;
        }
    }
}