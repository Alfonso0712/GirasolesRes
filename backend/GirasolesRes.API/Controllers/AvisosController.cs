using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AvisosController : ControllerBase
{
    private readonly IPedidoService _pedidoService;
    private readonly ILogger<AvisosController> _logger;

    public AvisosController(
        IPedidoService pedidoService,
        ILogger<AvisosController> logger)
    {
        _pedidoService = pedidoService;
        _logger = logger;
    }

    /// <summary>
    /// CUS09.3: Consulta los avisos de comanda lista pendientes (Vista 9.5). Roles: Mozo y Cajero.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ObtenerAvisosPendientes(CancellationToken cancellationToken)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        if (!string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        try
        {
            var avisos = await _pedidoService.ObtenerAvisosPendientesAsync(usuarioId, rol, cancellationToken);
            return Ok(avisos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar avisos pendientes.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error al obtener los avisos." });
        }
    }

    /// <summary>
    /// CUS09.3: Marca un aviso como visto tras cerrarlo en pantalla. Roles: Mozo y Cajero.
    /// </summary>
    [HttpPost("{id:guid}/visto")]
    public async Task<IActionResult> MarcarVisto(Guid id, CancellationToken cancellationToken)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        if (!string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Usuario";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            await _pedidoService.MarcarAvisoVistoAsync(id, usuarioId, nombreUsuario, ip, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al marcar aviso {ComandaId} como visto.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error al actualizar el aviso." });
        }
    }
}
