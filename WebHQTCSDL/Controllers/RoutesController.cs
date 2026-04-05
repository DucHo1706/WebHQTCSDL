using Microsoft.AspNetCore.Mvc;
using System;
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
        public async Task<IActionResult> GetAllRoutes()
        {
            try
            {
                var routes = await _repository.GetAllRoutesAsync();
                return Ok(new { success = true, data = routes });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}