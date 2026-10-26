using System.Security.Claims;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Mozo,Cajero,Administrador")]
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
    /// CUS09.3: Consulta los avisos de comanda lista pendientes (Vista 9.5). Roles: Mozo, Cajero, Administrador.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ObtenerAvisosPendientes(CancellationToken cancellationToken)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var avisos = await _pedidoService.ObtenerAvisosPendientesAsync(usuarioId, rol, cancellationToken);
        return Ok(avisos);
    }

    /// <summary>
    /// CUS09.3: Marca un aviso como visto tras cerrarlo en pantalla. Roles: Mozo, Cajero y Administrador.
    /// </summary>
    [HttpPost("{id:guid}/visto")]
    public async Task<IActionResult> MarcarVisto(Guid id, CancellationToken cancellationToken)
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Usuario";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        await _pedidoService.MarcarAvisoVistoAsync(id, usuarioId, nombreUsuario, ip, cancellationToken);
        return NoContent();
    }
}
