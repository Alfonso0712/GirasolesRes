using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Ventas;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Cajero,Administrador")]
public class VentasController : ControllerBase
{
    private readonly IVentaService _ventaService;
    private readonly ICobroService _cobroService;
    private readonly ILogger<VentasController> _logger;

    public VentasController(
        IVentaService ventaService,
        ICobroService cobroService,
        ILogger<VentasController> logger)
    {
        _ventaService = ventaService;
        _cobroService = cobroService;
        _logger = logger;
    }

    private string ObtenerNombreAdmin()
    {
        return User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("sub") ?? "Admin";
    }

    [HttpGet]
    public async Task<IActionResult> ListarVentas(
        [FromQuery] string? busqueda,
        [FromQuery] string? desde,
        [FromQuery] string? hasta,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = 20,
        CancellationToken ct = default)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        try
        {
            var resultado = await _ventaService.ListarVentasAsync(busqueda, desde, hasta, pagina, tamano, rol, ct);
            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al listar ventas.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_155 });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObtenerDetalle(Guid id, CancellationToken ct)
    {
        try
        {
            var detalle = await _ventaService.ObtenerDetalleVentaAsync(id, ct);
            return Ok(detalle);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al obtener detalle de venta {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_09 });
        }
    }

    [HttpPost("{id:guid}/anular")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> AnularVenta(
        Guid id,
        [FromBody] AnularVentaRequest request,
        CancellationToken ct)
    {
        var adminNombre = ObtenerNombreAdmin();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var resultado = await _ventaService.AnularVentaAsync(id, request, adminNombre, "Administrador", ip, ct);
            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (CobroConflictException ex)
        {
            return StatusCode(StatusCodes.Status409Conflict, new { codigo = ex.Codigo, message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al anular venta {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_164 });
        }
    }

    [HttpGet("{id:guid}/ticket")]
    public async Task<IActionResult> DescargarTicket(
        Guid id,
        [FromQuery] bool copia = true,
        CancellationToken ct = default)
    {
        try
        {
            var bytes = await _cobroService.GenerarComprobantePdfAsync(id, copia, ct);
            return File(bytes, "application/pdf", $"Comprobante_{id:N}_{(copia ? "COPIA" : "ORIGINAL")}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar comprobante de venta {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_148 });
        }
    }
}
