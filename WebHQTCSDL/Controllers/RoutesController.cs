using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebHQTCSDL.Repositories;

namespace WebHQTCSDL.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoutesController : ControllerBase
    {
        private readonly RouteRepository _repository;

        public RoutesController(RouteRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoutes()
        {
            try
            {
                var routes = await _repository.GetDistinctRoutesAsync();

                // Trả về JSON chuẩn giống như Node.js
                return Ok(new { success = true, data = routes });
            }
            catch (System.Exception ex)
            {
                // In lỗi ra console của Visual Studio để dễ bắt bệnh
                System.Console.WriteLine("LỖI: " + ex.Message);
                return StatusCode(500, new { success = false, message = "Lỗi kết nối cơ sở dữ liệu!" });
            }
        }
    }
}