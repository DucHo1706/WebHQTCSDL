using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using WebHQTCSDL.Repositories;

namespace WebHQTCSDL.Services
{
    public class ExpiredTicketCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public ExpiredTicketCleanupService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Vòng lặp chạy liên tục cho đến khi tắt ứng dụng Backend
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var repository = scope.ServiceProvider.GetRequiredService<AdminRepository>();
                        await repository.ClearExpiredTicketsAsync();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[LỖI AUTO CLEANUP]: {ex.Message}");
                }

                // Cho hệ thống "ngủ" 1 phút rồi mới lặp lại (Quét mỗi phút 1 lần)
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}