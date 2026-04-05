﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
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

        public async Task<IEnumerable<TripSearchDto>> SearchTripsAsync(string diemDi, string diemDen, DateTime? ngayKhachChon)
        {
            var trips = new List<TripSearchDto>();

            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SP_TimKiemChuyenXe_GheTrong";
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add("p_DiemDi", OracleDbType.Varchar2).Value = diemDi;
                    command.Parameters.Add("p_DiemDen", OracleDbType.Varchar2).Value = diemDen;
                    
                    if (ngayKhachChon.HasValue)
                    {
                        command.Parameters.Add("p_NgayKhachChon", OracleDbType.Date).Value = ngayKhachChon.Value.Date;
                    }
                    else
                    {
                        command.Parameters.Add("p_NgayKhachChon", OracleDbType.Date).Value = DBNull.Value;
                    }
                    
                    var refCursorParam = new OracleParameter("p_RefCursor", OracleDbType.RefCursor);
                    refCursorParam.Direction = ParameterDirection.Output;
                    command.Parameters.Add(refCursorParam);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            trips.Add(new TripSearchDto
                            {
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

        public async Task<IEnumerable<string>> GetBookedSeatsAsync(string chuyenXeId)
        {
            var bookedSeats = new List<string>();
            using (var connection = new OracleConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SELECT MaGhe FROM VE WHERE ChuyenXeId = :chuyenXeId AND TrangThai IN ('GiuCho', 'DaXuat')";
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
    }
}