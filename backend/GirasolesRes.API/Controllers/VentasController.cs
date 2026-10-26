using System.Security.Claims;
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
        var resultado = await _ventaService.ListarVentasAsync(busqueda, desde, hasta, pagina, tamano, rol, ct);
        return Ok(resultado);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObtenerDetalle(Guid id, CancellationToken ct)
    {
        var detalle = await _ventaService.ObtenerDetalleVentaAsync(id, ct);
        return Ok(detalle);
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

        var resultado = await _ventaService.AnularVentaAsync(id, request, adminNombre, "Administrador", ip, ct);
        return Ok(resultado);
    }

    [HttpGet("{id:guid}/ticket")]
    public async Task<IActionResult> DescargarTicket(
        Guid id,
        [FromQuery] bool copia = true,
        CancellationToken ct = default)
    {
        var bytes = await _cobroService.GenerarComprobantePdfAsync(id, copia, ct);
        return File(bytes, "application/pdf", $"Comprobante_{id:N}_{(copia ? "COPIA" : "ORIGINAL")}.pdf");
    }
}
