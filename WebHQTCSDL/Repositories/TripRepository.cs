using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using WebHQTCSDL.Models;

namespace WebHQTCSDL.Repositories
{
    public class TripRepository
    {
        private readonly string _connectionString;

        public TripRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbContext");
        }

        public async Task<IEnumerable<TripDto>> SearchTripsAsync(string diemDi, string diemDen, DateTime ngayDi)
        {
            var trips = new List<TripDto>();

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    // Gọi Procedure Tìm Kiếm
                    command.CommandText = "SP_TimKiemChuyenXe_GheTrong";
                    command.CommandType = CommandType.StoredProcedure;

                    // 1. Truyền tham số IN
                    command.Parameters.Add("p_DiemDi", OracleDbType.Varchar2).Value = diemDi;
                    command.Parameters.Add("p_DiemDen", OracleDbType.Varchar2).Value = diemDen;
                    command.Parameters.Add("p_NgayKhachChon", OracleDbType.Date).Value = ngayDi;

                    // 2. Hứng tham số OUT dạng SYS_REFCURSOR
                    var refCursorParam = new OracleParameter("p_RefCursor", OracleDbType.RefCursor);
                    refCursorParam.Direction = ParameterDirection.Output;
                    command.Parameters.Add(refCursorParam);

                    // 3. Đọc dữ liệu từ Cursor
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            trips.Add(new TripDto
                            {
                                // Chú ý: C# lấy tên cột từ Oracle mặc định là CHỮ IN HOA
                                ChuyenXeId = reader["CHUYENXEID"].ToString(),
                                TenTuyen = reader["TENTUYEN"].ToString(),
                                ThoiGianXuatPhat = Convert.ToDateTime(reader["THOIGIANXUATPHAT"]),
                                TenLoai = reader["TENLOAI"].ToString(),
                                SoLuongGhe = Convert.ToInt32(reader["SOLUONGGHE"]),
                                SoGheConTrong = Convert.ToInt32(reader["SOGHECONTRONG"]),
                                GiaVeCoBan = Convert.ToDecimal(reader["GIAVECOBAN"])
                            });
                        }
                    }
                }
            }
            return trips;
        }
        // Hàm mới: Lấy danh sách mã ghế đã được đặt của 1 chuyến xe
        public async Task<List<string>> GetBookedSeatsAsync(string chuyenXeId)
        {
            var bookedSeats = new List<string>();

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    // Lấy các ghế đang Giữ Chỗ hoặc Đã Xuất
                    command.CommandText = "SELECT MaGhe FROM VE WHERE ChuyenXeId = :chuyenXeId AND TrangThai IN ('GiuCho', 'DaXuat')";
                    command.CommandType = CommandType.Text;

                    command.Parameters.Add("chuyenXeId", OracleDbType.Varchar2).Value = chuyenXeId;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            bookedSeats.Add(reader["MAGHE"].ToString());
                        }
                    }
                }
            }
            return bookedSeats;
        }
        public async Task<IEnumerable<TripDto>> GetFeaturedTripsAsync()
        {
            var trips = new List<TripDto>();
            using (var connection = new OracleConnection(_connectionString))
            {
              //  WHERE c.TrangThai = 'SapChay' AND c.ThoiGianXuatPhat > CURRENT_TIMESTAMP
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT c.ChuyenXeId, t.TenTuyen, c.ThoiGianXuatPhat, lx.TenLoai, 
                               lx.SoLuongGhe, c.GiaVeCoBan, t.DiemDi, t.DiemDen
                        FROM CHUYENXE c
                        JOIN TUYENXE t ON c.TuyenXeId = t.TuyenXeId
                        JOIN XE x ON c.XeId = x.XeId
                        JOIN LOAIXE lx ON x.LoaiXeId = lx.LoaiXeId
                        WHERE c.TrangThai = 'SapChay' 
                        ORDER BY c.ThoiGianXuatPhat ASC
                        FETCH FIRST 3 ROWS ONLY";

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            trips.Add(new TripDto
                            {
                                ChuyenXeId = reader["CHUYENXEID"].ToString(),
                                TenTuyen = reader["TENTUYEN"].ToString(),
                                ThoiGianXuatPhat = Convert.ToDateTime(reader["THOIGIANXUATPHAT"]),
                                TenLoai = reader["TENLOAI"].ToString(),
                                SoLuongGhe = Convert.ToInt32(reader["SOLUONGGHE"]),
                                SoGheConTrong = 0,
                                GiaVeCoBan = Convert.ToDecimal(reader["GIAVECOBAN"]),
                                // THÊM 2 DÒNG NÀY:
                                DiemDi = reader["DIEMDI"].ToString(),
                                DiemDen = reader["DIEMDEN"].ToString()
                            });
                        }
                    }
                }
            }
            return trips;
        }
    }
}