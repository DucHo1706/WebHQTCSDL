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
        public async Task<string> UpdateTripStatusAsync(string chuyenXeId, string action)
        {
            string outMessage = string.Empty;
            string spName = string.Empty;

            // Xác định Procedure cần gọi dựa trên hành động
            if (action == "start") spName = "SP_BatDauChuyenXe";
            else if (action == "complete") spName = "SP_HoanThanhChuyenXe";
            else if (action == "cancel") spName = "SP_HuyChuyenXe";
            else return "LỖI: Hành động không hợp lệ.";

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = spName;
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add("p_ChuyenXeId", OracleDbType.Varchar2).Value = chuyenXeId;

                    // Riêng SP_HuyChuyenXe cần thêm tham số Lý do hủy
                    if (action == "cancel")
                    {
                        command.Parameters.Add("p_LyDoHuy", OracleDbType.Varchar2).Value = "Quản trị viên hủy trên hệ thống";
                    }

                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200);
                    outParam.Direction = ParameterDirection.Output;
                    command.Parameters.Add(outParam);

                    await command.ExecuteNonQueryAsync();
                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }
        public async Task<System.Collections.Generic.IEnumerable<object>> GetVehiclesAsync()
        {
            var list = new System.Collections.Generic.List<object>();
            using (var conn = new OracleConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = conn.CreateCommand())
                {
                    // Lấy danh sách xe kèm theo tên loại xe (Limousine, Giường nằm...)
                    cmd.CommandText = @"
                        SELECT x.XeId, x.BienSo, lx.TenLoai 
                        FROM XE x 
                        JOIN LOAIXE lx ON x.LoaiXeId = lx.LoaiXeId
                        ORDER BY x.XeId ASC";

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new
                            {
                                XeId = reader["XEID"].ToString(),
                                BienSo = reader["BIENSO"].ToString(),
                                TenLoai = reader["TENLOAI"].ToString()
                            });
                        }
                    }
                }
            }
            return list;
        }
        // Da xoa tham so tuyenXeId o dau vao
        public async Task<string> AddRouteAsync(string tenTuyen, string diemDi, string diemDen, decimal khoangCach)
        {
            string outMessage = string.Empty;

            // Tu dong sinh ma tuyen xe moi (VD: TX-A1B2C3)
            string newTuyenXeId = "TX-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_ThemTuyenXe";
                    command.CommandType = CommandType.StoredProcedure;

                    // Truyen ma tuyen xe vua sinh tu dong vao Oracle
                    command.Parameters.Add("p_TuyenXeId", OracleDbType.Varchar2).Value = newTuyenXeId;
                    command.Parameters.Add("p_TenTuyen", OracleDbType.Varchar2).Value = tenTuyen;
                    command.Parameters.Add("p_DiemDi", OracleDbType.Varchar2).Value = diemDi;
                    command.Parameters.Add("p_DiemDen", OracleDbType.Varchar2).Value = diemDen;
                    command.Parameters.Add("p_KhoangCach", OracleDbType.Decimal).Value = khoangCach;

                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200) { Direction = ParameterDirection.Output };
                    command.Parameters.Add(outParam);

                    await command.ExecuteNonQueryAsync();
                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }

        public async Task<string> DeleteRouteAsync(string tuyenXeId)
        {
            string outMessage = string.Empty;
            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_XoaTuyenXe";
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add("p_TuyenXeId", OracleDbType.Varchar2).Value = tuyenXeId;
                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200) { Direction = ParameterDirection.Output };
                    command.Parameters.Add(outParam);

                    await command.ExecuteNonQueryAsync();
                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }
        public async Task<System.Collections.Generic.IEnumerable<WebHQTCSDL.Models.TicketDetailDto>> GetAllTicketsAsync()
        {
            var list = new System.Collections.Generic.List<WebHQTCSDL.Models.TicketDetailDto>();
            using (var conn = new OracleConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = conn.CreateCommand())
                {
                    // Goi thang vao VIEW da tao trong Oracle
                    cmd.CommandText = "SELECT * FROM VW_ChiTietVe_KhachHang ORDER BY NgayDat DESC";

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new WebHQTCSDL.Models.TicketDetailDto
                            {
                                HoTen = reader["HOTEN"].ToString(),
                                SoDienThoai = reader["SODIENTHOAI"].ToString(),
                                NgayDat = Convert.ToDateTime(reader["NGAYDAT"]),
                                TrangThaiThanhToan = reader["TRANGTHAITHANHTOAN"].ToString(),
                                TenTuyen = reader["TENTUYEN"].ToString(),
                                ThoiGianXuatPhat = Convert.ToDateTime(reader["THOIGIANXUATPHAT"]),
                                MaGhe = reader["MAGHE"].ToString(),
                                GiaVeThucTe = Convert.ToDecimal(reader["GIAVETHUCTE"]),
                                TrangThaiVe = reader["TRANGTHAIVE"].ToString()
                            });
                        }
                    }
                }
            }
            return list;
        }
    }
}