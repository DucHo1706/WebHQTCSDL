﻿using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using WebHQTCSDL.Models;

namespace WebHQTCSDL.Repositories
{
    public class BookingRepository
    {
        private readonly string _connectionString;

        public BookingRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbContext");
        }

        public async Task<string> BookTicketAsync(BookingRequest request)
        {
            string outMessage = string.Empty;

            // 1. Tự sinh ID cho Đơn hàng và Vé (VD: DH20260320... và VE-A1B2)
            string donHangId = "DH" + DateTime.Now.ToString("yyyyMMddHHmmss");
            string veId = "VE-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    // 2. Khai báo tên Procedure
                    command.CommandText = "SP_DatVe";
                    command.CommandType = CommandType.StoredProcedure;

                    // 3. Truyền các tham số IN
                    command.Parameters.Add("p_DonHangId", OracleDbType.Varchar2).Value = donHangId;
                    command.Parameters.Add("p_VeId", OracleDbType.Varchar2).Value = veId;
                    command.Parameters.Add("p_UserId", OracleDbType.Varchar2).Value = request.UserId;
                    command.Parameters.Add("p_ChuyenXeId", OracleDbType.Varchar2).Value = request.ChuyenXeId;
                    command.Parameters.Add("p_MaGhe", OracleDbType.Varchar2).Value = request.MaGhe;

                    // 4. Khai báo tham số OUT để hứng thông báo từ Oracle
                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200);
                    outParam.Direction = ParameterDirection.Output;
                    command.Parameters.Add(outParam);

                    // 5. Thực thi Procedure
                    await command.ExecuteNonQueryAsync();

                    // 6. Lấy kết quả trả ra
                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }
        // Hàm mới: Hủy đơn hàng và Hoàn tiền
        public async Task<string> CancelOrderAsync(string donHangId)
        {
            string outMessage = string.Empty;

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_HuyDonHang_HoanTien";
                    command.CommandType = CommandType.StoredProcedure;

                    // 1. Truyền tham số IN (Mã đơn hàng)
                    command.Parameters.Add("p_DonHangId", OracleDbType.Varchar2).Value = donHangId;

                    // 2. Khai báo tham số OUT (Lời nhắn từ Oracle)
                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200);
                    outParam.Direction = ParameterDirection.Output;
                    command.Parameters.Add(outParam);

                    // 3. Thực thi Procedure
                    await command.ExecuteNonQueryAsync();

                    // 4. Lấy kết quả trả ra
                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }
        public async Task<System.Collections.Generic.IEnumerable<BookingHistoryDto>> GetBookingHistoryAsync(string userId)
        {
            var history = new System.Collections.Generic.List<BookingHistoryDto>();
            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT v.VeId, t.TenTuyen, c.ThoiGianXuatPhat AS NgayDi, v.MaGhe, v.TrangThai,
                               v.GiaVeThucTe, dh.TrangThaiThanhToan, dh.DonHangId
                        FROM VE v
                        JOIN DONHANG dh ON v.DonHangId = dh.DonHangId
                        JOIN CHUYENXE c ON v.ChuyenXeId = c.ChuyenXeId
                        JOIN TUYENXE t ON c.TuyenXeId = t.TuyenXeId
                        WHERE dh.UserId = :userId
                        ORDER BY c.ThoiGianXuatPhat DESC";

                    command.Parameters.Add("userId", OracleDbType.Varchar2).Value = userId;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            history.Add(new BookingHistoryDto
                            {
                                VeId = reader["VEID"].ToString(),
                                DonHangId = reader["DONHANGID"].ToString(),
                                TenTuyen = reader["TENTUYEN"].ToString(),
                                NgayDi = System.Convert.ToDateTime(reader["NGAYDI"]),
                                MaGhe = reader["MAGHE"].ToString(),
                                TrangThaiVe = reader["TRANGTHAI"].ToString(),
                                GiaVe = System.Convert.ToDecimal(reader["GIAVETHUCTE"]),
                                TrangThaiThanhToan = reader["TRANGTHAITHANHTOAN"].ToString()
                            });
                        }
                    }
                }
            }
            return history;
        }
        public async Task<string> PayOrderAsync(string donHangId)
        {
            string outMessage = string.Empty;
            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_ThanhToanDonHang";
                    command.CommandType = System.Data.CommandType.StoredProcedure;

                    command.Parameters.Add("p_DonHangId", OracleDbType.Varchar2).Value = donHangId;

                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200) { Direction = System.Data.ParameterDirection.Output };
                    command.Parameters.Add(outParam);

                    await command.ExecuteNonQueryAsync();
                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }

        public async Task<string> ExchangeTicketAsync(ExchangeRequest request)
        {
            string outMessage = string.Empty;
            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_DoiVe";
                    command.CommandType = System.Data.CommandType.StoredProcedure;

                    command.Parameters.Add("p_VeCuId", OracleDbType.Varchar2).Value = request.VeCuId;
                    command.Parameters.Add("p_ChuyenXeMoiId", OracleDbType.Varchar2).Value = request.ChuyenXeMoiId;
                    command.Parameters.Add("p_MaGheMoi", OracleDbType.Varchar2).Value = request.MaGheMoi;

                    var outParam = new OracleParameter("p_OUT_Message", OracleDbType.Varchar2, 200) { Direction = System.Data.ParameterDirection.Output };
                    command.Parameters.Add(outParam);

                    await command.ExecuteNonQueryAsync();
                    outMessage = outParam.Value.ToString();
                }
            }
            return outMessage;
        }
    }
}