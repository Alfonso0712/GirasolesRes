using System.Security.Claims;
using GirasolesRes.Application.Common;

using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConsultasController : ControllerBase
{
    private readonly IConsultaDocumentoService _consultaService;
    private readonly ILogger<ConsultasController> _logger;

    public ConsultasController(
        IConsultaDocumentoService consultaService,
        ILogger<ConsultasController> logger)
    {
        _consultaService = consultaService;
        _logger = logger;
    }

    [HttpGet("dni/{dni}")]
    public async Task<IActionResult> ConsultarDni([FromRoute] string dni, CancellationToken ct)
    {
        var rol = User.FindFirstValue(System.Security.Claims.ClaimTypes.Role);
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }
        var dniTrim = dni?.Trim() ?? string.Empty;
        if (dniTrim.Length != 8 || !dniTrim.All(char.IsDigit))
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_226 });
        }

        try
        {
            var resultado = await _consultaService.ConsultarDniAsync(dniTrim, ct);
            if (resultado == null)
            {
                return NotFound(new { message = MensajesCatalogo.MSG_228 });
            }

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar DNI {Dni}", dniTrim);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = MensajesCatalogo.MSG_230 });
        }
    }

    [HttpGet("ruc/{ruc}")]
    public async Task<IActionResult> ConsultarRuc([FromRoute] string ruc, CancellationToken ct)
    {
        var rol = User.FindFirstValue(System.Security.Claims.ClaimTypes.Role);
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }
        var rucTrim = ruc?.Trim() ?? string.Empty;
        if (rucTrim.Length != 11 || !rucTrim.All(char.IsDigit))
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_227 });
        }

        try
        {
            var resultado = await _consultaService.ConsultarRucAsync(rucTrim, ct);
            if (resultado == null)
            {
                return NotFound(new { message = MensajesCatalogo.MSG_228 });
            }

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar RUC {Ruc}", rucTrim);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = MensajesCatalogo.MSG_230 });
        }
    }
}
