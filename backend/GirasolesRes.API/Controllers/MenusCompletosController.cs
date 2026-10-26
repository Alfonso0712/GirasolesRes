using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenusCompletos;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/menus-completos")]
[Authorize]
public class MenusCompletosController : ControllerBase
{
    private readonly IMenuCompletoService _menuCompletoService;
    private readonly ILogger<MenusCompletosController> _logger;

    public MenusCompletosController(
        IMenuCompletoService menuCompletoService,
        ILogger<MenusCompletosController> logger)
    {
        _menuCompletoService = menuCompletoService;
        _logger = logger;
    }

    /// <summary>
    /// CUS04.5: Listar menús completos configurados en el sistema
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Administrador,Cajero,Mozo,Cocinero")]
    public async Task<IActionResult> Listar(
        [FromQuery] bool? soloActivos,
        CancellationToken cancellationToken = default)
    {
        var esAdmin = User.IsInRole("Administrador");
        var filtrarSoloActivos = soloActivos ?? !esAdmin;

        var resultado = await _menuCompletoService.ObtenerTodosAsync(filtrarSoloActivos, cancellationToken);
        if (!resultado.IsSuccess)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS04.5: Obtener un menú completo por su Id
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Administrador,Cajero,Mozo,Cocinero")]
    public async Task<IActionResult> ObtenerPorId(int id, CancellationToken cancellationToken = default)
    {
        var resultado = await _menuCompletoService.ObtenerPorIdAsync(id, cancellationToken);
        if (!resultado.IsSuccess)
        {
            return NotFound(new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS04.5: Modificar el precio de un menú completo (RV-160 / RN-140)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ActualizarPrecio(
        int id,
        [FromBody] ActualizarPrecioMenuCompletoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
        {
            return BadRequest(new
            {
                success = false,
                message = MensajesCatalogo.MSG_55
            });
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var admin = ObtenerNombreAdmin();

        var resultado = await _menuCompletoService.ActualizarPrecioAsync(id, request, admin, ip, cancellationToken);
        if (!resultado.IsSuccess)
        {
            if (resultado.Errors != null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = resultado.Message,
                    errors = resultado.Errors
                });
            }

            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS04.5: Activar o desactivar un menú completo (MSG-218)
    /// </summary>
    [HttpPatch("{id:int}/estado")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CambiarEstado(
        int id,
        [FromBody] CambiarEstadoMenuCompletoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
        {
            return BadRequest(new
            {
                success = false,
                message = "El cuerpo de la solicitud no puede estar vacío."
            });
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var admin = ObtenerNombreAdmin();

        var resultado = await _menuCompletoService.CambiarEstadoAsync(id, request, admin, ip, cancellationToken);
        if (!resultado.IsSuccess)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(resultado.Data);
    }

    private string ObtenerNombreAdmin()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst("nombre_usuario")?.Value
            ?? User.Identity?.Name
            ?? "admin";
    }
}
