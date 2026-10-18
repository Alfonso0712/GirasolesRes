using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CajaController : ControllerBase
{
    private readonly ICajaService _cajaService;
    private readonly ILogger<CajaController> _logger;

    public CajaController(ICajaService cajaService, ILogger<CajaController> logger)
    {
        _cajaService = cajaService;
        _logger = logger;
    }

    private bool ValidarRolCajeroOAdmin(out IActionResult? forbiddenResult)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
        {
            forbiddenResult = StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
            return false;
        }

        forbiddenResult = null;
        return true;
    }

    [HttpGet("estado")]
    public async Task<IActionResult> ObtenerEstado(CancellationToken ct)
    {
        if (!ValidarRolCajeroOAdmin(out var forbidden))
        {
            return forbidden!;
        }

        try
        {
            var estado = await _cajaService.ObtenerEstadoCajaAsync(ct);
            return Ok(estado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar estado de la caja.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error al consultar estado de la caja." });
        }
    }

    [HttpPost("abrir")]
    public async Task<IActionResult> Abrir([FromBody] AbrirCajaRequest request, CancellationToken ct)
    {
        if (!ValidarRolCajeroOAdmin(out var forbidden))
        {
            return forbidden!;
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_38, errors = ModelState });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Cajero";

        try
        {
            var estado = await _cajaService.AbrirCajaAsync(request, usuarioId, nombreUsuario, ct);
            return Ok(new
            {
                message = "Caja abierta exitosamente.",
                caja = estado
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar apertura de caja.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "No se pudo abrir la caja. Intente nuevamente." });
        }
    }
}
