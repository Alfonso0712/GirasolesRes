using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportesController : ControllerBase
{
    private readonly IReporteService _reporteService;
    private readonly ILogger<ReportesController> _logger;

    public ReportesController(
        IReporteService reporteService,
        ILogger<ReportesController> logger)
    {
        _reporteService = reporteService;
        _logger = logger;
    }

    private bool ValidarSoloAdmin(out string nombreUsuario, out IActionResult? forbiddenResult)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        nombreUsuario = User.FindFirstValue("nombreCompleto") 
            ?? User.FindFirstValue(ClaimTypes.Name) 
            ?? User.FindFirstValue("usuario") 
            ?? "Administrador";

        if (!string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
        {
            forbiddenResult = StatusCode(StatusCodes.Status403Forbidden, new
            {
                success = false,
                message = MensajesCatalogo.MSG_39,
                error = MensajesCatalogo.MSG_39
            });
            return false;
        }

        forbiddenResult = null;
        return true;
    }

    /// <summary>
    /// CUS14.1 / Vista 14.1 / RF-37: Consulta el reporte consolidado de ventas por rango de fechas.
    /// </summary>
    [HttpGet("ventas")]
    public async Task<IActionResult> ObtenerReporteVentas(
        [FromQuery] string? desde,
        [FromQuery] string? hasta,
        CancellationToken ct)
    {
        if (!ValidarSoloAdmin(out _, out var forbiddenResult))
        {
            return forbiddenResult!;
        }

        try
        {
            var resultado = await _reporteService.ConsultarReporteVentasAsync(desde, hasta, ct);
            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar reporte de ventas.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = MensajesCatalogo.MSG_194,
                error = MensajesCatalogo.MSG_194
            });
        }
    }

    /// <summary>
    /// CUS14.2 / Vistas 14.2 y 14.3 / RF-38: Consulta el reporte de platos vendidos por categoría y producto.
    /// </summary>
    [HttpGet("platos")]
    public async Task<IActionResult> ObtenerReportePlatos(
        [FromQuery] string? desde,
        [FromQuery] string? hasta,
        [FromQuery] Guid? productoId,
        CancellationToken ct)
    {
        if (!ValidarSoloAdmin(out _, out var forbiddenResult))
        {
            return forbiddenResult!;
        }

        try
        {
            var resultado = await _reporteService.ConsultarReportePlatosAsync(desde, hasta, productoId, ct);
            return Ok(resultado);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message, error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar platos vendidos.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = MensajesCatalogo.MSG_195,
                error = MensajesCatalogo.MSG_195
            });
        }
    }

    /// <summary>
    /// CUS14.1 / RV-142 / RNF-53: Exporta el reporte de ventas en formato PDF o Excel (CSV).
    /// </summary>
    [HttpGet("ventas/exportar")]
    public async Task<IActionResult> ExportarReporteVentas(
        [FromQuery] string? desde,
        [FromQuery] string? hasta,
        [FromQuery] string? formato,
        CancellationToken ct)
    {
        if (!ValidarSoloAdmin(out var nombreUsuario, out var forbiddenResult))
        {
            return forbiddenResult!;
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var fmt = formato?.Trim().ToLowerInvariant() ?? "csv";

        try
        {
            if (fmt == "pdf")
            {
                var bytes = await _reporteService.ExportarReporteVentasPdfAsync(desde, hasta, nombreUsuario, ip, ct);
                var filename = $"Reporte_Ventas_{desde ?? "hoy"}_{hasta ?? "hoy"}.pdf";
                return File(bytes, "application/pdf", filename);
            }
            else
            {
                var bytes = await _reporteService.ExportarReporteVentasCsvAsync(desde, hasta, nombreUsuario, ip, ct);
                var filename = $"Reporte_Ventas_{desde ?? "hoy"}_{hasta ?? "hoy"}.csv";
                return File(bytes, "text/csv; charset=utf-8", filename);
            }
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al exportar reporte de ventas.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = MensajesCatalogo.MSG_201,
                error = MensajesCatalogo.MSG_201
            });
        }
    }

    /// <summary>
    /// CUS14.2 / RV-142 / RNF-53: Exporta el reporte de platos vendidos en formato PDF o Excel (CSV).
    /// </summary>
    [HttpGet("platos/exportar")]
    public async Task<IActionResult> ExportarReportePlatos(
        [FromQuery] string? desde,
        [FromQuery] string? hasta,
        [FromQuery] Guid? productoId,
        [FromQuery] string? formato,
        CancellationToken ct)
    {
        if (!ValidarSoloAdmin(out var nombreUsuario, out var forbiddenResult))
        {
            return forbiddenResult!;
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var fmt = formato?.Trim().ToLowerInvariant() ?? "csv";

        try
        {
            if (fmt == "pdf")
            {
                var bytes = await _reporteService.ExportarReportePlatosPdfAsync(desde, hasta, productoId, nombreUsuario, ip, ct);
                var filename = $"Reporte_Platos_{desde ?? "hoy"}_{hasta ?? "hoy"}.pdf";
                return File(bytes, "application/pdf", filename);
            }
            else
            {
                var bytes = await _reporteService.ExportarReportePlatosCsvAsync(desde, hasta, productoId, nombreUsuario, ip, ct);
                var filename = $"Reporte_Platos_{desde ?? "hoy"}_{hasta ?? "hoy"}.csv";
                return File(bytes, "text/csv; charset=utf-8", filename);
            }
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message, error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al exportar reporte de platos.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = MensajesCatalogo.MSG_201,
                error = MensajesCatalogo.MSG_201
            });
        }
    }
}
