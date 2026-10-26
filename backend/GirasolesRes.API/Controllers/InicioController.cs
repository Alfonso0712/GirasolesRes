using System.Security.Claims;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InicioController : ControllerBase
{
    private readonly IInicioService _inicioService;
    private readonly ILogger<InicioController> _logger;

    public InicioController(
        IInicioService inicioService,
        ILogger<InicioController> logger)
    {
        _inicioService = inicioService;
        _logger = logger;
    }

    private string ObtenerRol()
    {
        return User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }

    private Guid ObtenerUsuarioId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }

    /// <summary>
    /// CUS15 / RF-39, RF-40: Consulta el resumen del dashboard según el rol del usuario autenticado.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ObtenerInicio(CancellationToken ct)
    {
        var rol = ObtenerRol();
        var usuarioId = ObtenerUsuarioId();

        var resultado = await _inicioService.ObtenerInicioAsync(rol, usuarioId, ct);
        return Ok(resultado);
    }

    /// <summary>
    /// CUS15 / RNF-55, RV-149: Consulta un bloque específico para actualización o reintento individual.
    /// </summary>
    [HttpGet("{bloque}")]
    public async Task<IActionResult> ObtenerBloque(string bloque, CancellationToken ct)
    {
        var rol = ObtenerRol();
        var usuarioId = ObtenerUsuarioId();

        var resultado = await _inicioService.ObtenerBloqueAsync(bloque, rol, usuarioId, ct);
        return Ok(resultado);
    }
}
