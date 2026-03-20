using System.Data;
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
    }
}