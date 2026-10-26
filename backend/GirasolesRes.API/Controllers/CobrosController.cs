using System.Security.Claims;
using GirasolesRes.Application.Common;
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
        var pedidos = await _cobroService.ObtenerPedidosPendientesCobroAsync(ct);
        return Ok(pedidos);
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

        var resultado = await _cobroService.ProcesarCobroAsync(request, usuarioId, nombreUsuario, direccionIp, ct);
        return CreatedAtAction(nameof(ObtenerComprobante), new { ventaId = resultado.VentaId }, resultado);
    }

    [HttpGet("comprobantes/{ventaId:guid}")]
    public async Task<IActionResult> ObtenerComprobante([FromRoute] Guid ventaId, [FromQuery] bool copia = false, CancellationToken ct = default)
    {
        var comprobante = await _cobroService.ObtenerComprobanteAsync(ventaId, copia, ct);
        return Ok(comprobante);
    }

    [HttpGet("comprobantes/{ventaId:guid}/pdf")]
    public async Task<IActionResult> DescargarComprobantePdf([FromRoute] Guid ventaId, [FromQuery] bool copia = false, CancellationToken ct = default)
    {
        var bytes = await _cobroService.GenerarComprobantePdfAsync(ventaId, copia, ct);
        var filename = $"Comprobante_{ventaId:N}_{(copia ? "COPIA" : "ORIGINAL")}.pdf";
        return File(bytes, "application/pdf", filename);
    }
}
