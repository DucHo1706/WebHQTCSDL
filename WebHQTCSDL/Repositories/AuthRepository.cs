using System;
﻿using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using WebHQTCSDL.Models;

namespace WebHQTCSDL.Repositories
{
    public class AuthRepository
    {
        private readonly string _connectionString;

        public AuthRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbContext");
        }

        public async Task<UserDto> AuthenticateAsync(string soDienThoai, string matKhau)
        {
            UserDto user = null;

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    // Lấy user và danh sách vai trò
                    command.CommandText = @"
                        SELECT u.UserId, u.HoTen, v.TenVaiTro
                        FROM NGUOIDUNG u
                        LEFT JOIN USER_ROLE ur ON u.UserId = ur.UserId
                        LEFT JOIN VAITRO v ON ur.RoleId = v.RoleId
                        WHERE u.SoDienThoai = :phone AND u.MatKhau = :pass";

                    command.Parameters.Add("phone", OracleDbType.Varchar2).Value = soDienThoai;
                    command.Parameters.Add("pass", OracleDbType.Varchar2).Value = matKhau;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            if (user == null)
                            {
                                user = new UserDto
                                {
                                    UserId = reader["USERID"].ToString(),
                                    HoTen = reader["HOTEN"].ToString()
                                };
                            }

                            // Thêm Role vào danh sách nếu có (VD: "Admin", "NhanVien")
                            if (!reader.IsDBNull(reader.GetOrdinal("TENVAITRO")))
                            {
                                user.Roles.Add(reader["TENVAITRO"].ToString());
                            }
                        }
                    }
                }
            }
            return user; // Sẽ trả về null nếu sai sđt hoặc mật khẩu
        }

        public async Task<string> RegisterAsync(string hoTen, string soDienThoai, string email, string matKhau)
        {
            try
            {
                using (var connection = new OracleConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        // Tự sinh UserId ngẫu nhiên
                        string userId = Guid.NewGuid().ToString("N").Substring(0, 10).ToUpper();
                        
                        // Chạy khối lệnh BEGIN..END để Insert vào cả 2 bảng cùng lúc
                        command.CommandText = @"
                            BEGIN
                                INSERT INTO NGUOIDUNG (UserId, HoTen, SoDienThoai, Email, MatKhau) 
                                VALUES (:userId, :hoTen, :soDienThoai, :email, :matKhau);
                                
                                INSERT INTO USER_ROLE (UserId, RoleId) 
                                VALUES (:userId, '3');
                            END;";
                        
                        command.Parameters.Add("userId", OracleDbType.Varchar2).Value = userId;
                        command.Parameters.Add("hoTen", OracleDbType.Varchar2).Value = hoTen;
                        command.Parameters.Add("soDienThoai", OracleDbType.Varchar2).Value = soDienThoai;
                        command.Parameters.Add("email", OracleDbType.Varchar2).Value = email;
                        command.Parameters.Add("matKhau", OracleDbType.Varchar2).Value = matKhau;

                        await command.ExecuteNonQueryAsync();
                        return "Đăng ký tài khoản thành công!";
                    }
                }
            }
            catch (OracleException ex)
            {
                // Mã lỗi 1 của Oracle là Unique Constraint Violated (Trùng lặp dữ liệu)
                if (ex.Number == 1)
                {
                    throw new Exception("Số điện thoại này đã được đăng ký! Vui lòng sử dụng số điện thoại khác.");
                }
                throw; // Ném ra các lỗi khác nếu có
            }
        }
    }
}