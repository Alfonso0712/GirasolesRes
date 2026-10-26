using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Cobros;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Cajero")]
public class CobrosController : ControllerBase
{
    private readonly ICobroService _cobroService;
    private readonly ILogger<CobrosController> _logger;

    public CobrosController(ICobroService cobroService, ILogger<CobrosController> logger)
    {
        _cobroService = cobroService;
        _logger = logger;
    }

    [HttpGet("pendientes")]
    public async Task<IActionResult> ObtenerPendientesCobro(CancellationToken ct)
    {
        try
        {
            var pedidos = await _cobroService.ObtenerPedidosPendientesCobroAsync(ct);
            return Ok(pedidos);
        }
        catch (CobroConflictException ex)
        {
            return StatusCode(StatusCodes.Status409Conflict, new
            {
                codigo = ex.Codigo,
                message = ex.Message,
                mensaje = ex.Message,
                totalActual = ex.TotalActual
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener pedidos pendientes de cobro.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error al obtener pedidos pendientes de cobro." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> ProcesarCobro([FromBody] CobroRequest request, CancellationToken ct)
    {
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
        var direccionIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var resultado = await _cobroService.ProcesarCobroAsync(request, usuarioId, nombreUsuario, direccionIp, ct);
            return CreatedAtAction(nameof(ObtenerComprobante), new { ventaId = resultado.VentaId }, resultado);
        }
        catch (CobroConflictException ex)
        {
            return StatusCode(StatusCodes.Status409Conflict, new
            {
                codigo = ex.Codigo,
                message = ex.Message,
                mensaje = ex.Message,
                totalActual = ex.TotalActual
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar el cobro para el pedido {PedidoId}.", request.PedidoId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_147 });
        }
    }

    [HttpGet("comprobantes/{ventaId:guid}")]
    public async Task<IActionResult> ObtenerComprobante([FromRoute] Guid ventaId, [FromQuery] bool copia = false, CancellationToken ct = default)
    {
        try
        {
            var comprobante = await _cobroService.ObtenerComprobanteAsync(ventaId, copia, ct);
            return Ok(comprobante);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener el comprobante de la venta {VentaId}.", ventaId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_148 });
        }
    }

    [HttpGet("comprobantes/{ventaId:guid}/pdf")]
    public async Task<IActionResult> DescargarComprobantePdf([FromRoute] Guid ventaId, [FromQuery] bool copia = false, CancellationToken ct = default)
    {
        try
        {
            var bytes = await _cobroService.GenerarComprobantePdfAsync(ventaId, copia, ct);
            var filename = $"Comprobante_{ventaId:N}_{(copia ? "COPIA" : "ORIGINAL")}.pdf";
            return File(bytes, "application/pdf", filename);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar comprobante para descarga.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_148 });
        }
    }
}
