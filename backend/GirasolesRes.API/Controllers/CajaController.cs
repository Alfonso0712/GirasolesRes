using System.Globalization;
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
    private readonly IPdfCierreService _pdfCierreService;
    private readonly ILogger<CajaController> _logger;

    public CajaController(
        ICajaService cajaService,
        IPdfCierreService pdfCierreService,
        ILogger<CajaController> logger)
    {
        _cajaService = cajaService;
        _pdfCierreService = pdfCierreService;
        _logger = logger;
    }

    /// <summary>
    /// CUS 13.1 / HU34: Consulta el estado operativo actual de la caja, apertura activa, ventas parciales y sugerencia inicial.
    /// </summary>
    [HttpGet("actual")]
    [Authorize(Roles = "Cajero,Administrador")]
    public async Task<IActionResult> ObtenerActual(CancellationToken ct)
    {
        var usuarioId = ObtenerUsuarioId();
        var resultado = await _cajaService.ConsultarEstadoActualAsync(usuarioId, ct);
        return Ok(new
        {
            estado = resultado.Estado,
            mensaje = resultado.Mensaje,
            message = resultado.Mensaje,
            apertura = resultado.Apertura,
            resumenParcial = resultado.ResumenParcial,
            sugerenciaMontoInicial = resultado.SugerenciaMontoInicial
        });
    }

    /// <summary>
    /// CUS 13.1 / HU34 / RV-119..RV-121: Apertura de caja con fondo inicial y token de idempotencia.
    /// </summary>
    [HttpPost("abrir")]
    [Authorize(Roles = "Cajero")]
    public async Task<IActionResult> Abrir([FromBody] AbrirCajaRequestDto request, CancellationToken ct)
    {
        // 1. Validación de monto inicial obligatorio (MSG-169)
        if (request == null || !request.MontoInicial.HasValue)
        {
            return BadRequest(new
            {
                codigo = "monto_requerido",
                message = MensajesCatalogo.MSG_169,
                mensaje = MensajesCatalogo.MSG_169
            });
        }

        // 2. Validación de rango inferior y precisión decimal (RV-120, MSG-170)
        var monto = request.MontoInicial.Value;
        if (monto < 0.00m || decimal.Round(monto, 2) != monto)
        {
            return BadRequest(new
            {
                codigo = "monto_invalido",
                message = MensajesCatalogo.MSG_170,
                mensaje = MensajesCatalogo.MSG_170
            });
        }

        // 3. Validación de límite superior S/ 99,999.99 (RV-120, MSG-171)
        if (monto > 99999.99m)
        {
            return BadRequest(new
            {
                codigo = "monto_excedido",
                message = MensajesCatalogo.MSG_171,
                mensaje = MensajesCatalogo.MSG_171
            });
        }

        // 4. Extracción de identidad del cajero autenticado
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == Guid.Empty)
        {
            return Unauthorized(new
            {
                message = "Token inválido o expirado.",
                mensaje = "Token inválido o expirado."
            });
        }

        var nombreUsuario = ObtenerNombreUsuario();

        try
        {
            var resultado = await _cajaService.AbrirCajaAsync(request, usuarioId, nombreUsuario, ct);
            return StatusCode(StatusCodes.Status201Created, resultado);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException pg && pg.SqlState == "23505")
        {
            return StatusCode(StatusCodes.Status409Conflict, new
            {
                codigo = "caja_ya_abierta",
                message = MensajesCatalogo.MSG_167,
                mensaje = MensajesCatalogo.MSG_167
            });
        }
    }

    /// <summary>
    /// CUS 13.2 / HU35 / RV-122 / RV-123: Resumen contable de ventas vigentes, pedidos pendientes y efectivo esperado.
    /// </summary>
    [HttpGet("cierre/resumen")]
    [Authorize(Roles = "Cajero")]
    public async Task<IActionResult> ObtenerResumenCierre(CancellationToken ct)
    {
        var usuarioId = ObtenerUsuarioId();
        var resumen = await _cajaService.ObtenerResumenCierreAsync(usuarioId, ct);
        return Ok(resumen);
    }

    /// <summary>
    /// CUS 13.2 / HU35 / RV-124..RV-129 / RN-109..RN-112: Cierre atómico de caja, cuadre y registro de arqueo.
    /// </summary>
    [HttpPost("cerrar")]
    [Authorize(Roles = "Cajero")]
    public async Task<IActionResult> Cerrar([FromBody] CerrarCajaRequestDto request, CancellationToken ct)
    {
        // 1. Validación de efectivo contado obligatorio (RV-124, MSG-175)
        if (request == null || !request.EfectivoContado.HasValue)
        {
            return BadRequest(new
            {
                codigo = "efectivo_contado_requerido",
                message = MensajesCatalogo.MSG_175,
                mensaje = MensajesCatalogo.MSG_175
            });
        }

        var contado = request.EfectivoContado.Value;

        // 2. Validación de rango inferior y precisión decimal (RV-124, MSG-170)
        if (contado < 0.00m || decimal.Round(contado, 2) != contado)
        {
            return BadRequest(new
            {
                codigo = "monto_invalido",
                message = MensajesCatalogo.MSG_170,
                mensaje = MensajesCatalogo.MSG_170
            });
        }

        // 3. Validación de límite superior S/ 99,999.99 (RV-124, MSG-171)
        if (contado > 99999.99m)
        {
            return BadRequest(new
            {
                codigo = "monto_excedido",
                message = MensajesCatalogo.MSG_171,
                mensaje = MensajesCatalogo.MSG_171
            });
        }

        // 4. Validación de longitud máxima de observación (RV-126, MSG-179)
        if (!string.IsNullOrWhiteSpace(request.Observacion) && request.Observacion.Trim().Length > 200)
        {
            return BadRequest(new
            {
                codigo = "observacion_excedida",
                message = MensajesCatalogo.MSG_179,
                mensaje = MensajesCatalogo.MSG_179
            });
        }

        // 5. Extracción de identidad del cajero autenticado
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == Guid.Empty)
        {
            return Unauthorized(new
            {
                message = "Token inválido o expirado.",
                mensaje = "Token inválido o expirado."
            });
        }

        var nombreUsuario = ObtenerNombreUsuario();

        try
        {
            var resultado = await _cajaService.CerrarCajaAsync(request, usuarioId, nombreUsuario, ct);
            return Ok(resultado);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException)
        {
            return StatusCode(StatusCodes.Status409Conflict, new
            {
                codigo = "caja_ya_cerrada",
                message = MensajesCatalogo.MSG_183,
                mensaje = MensajesCatalogo.MSG_183
            });
        }
    }

    /// <summary>
    /// CUS 13.3 / HU36 / RV-130 / RN-106: Historial de cierres de caja con paginación de 20 y filtros de fecha. Solo Administrador.
    /// </summary>
    [HttpGet("cierres")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ObtenerCierres(
        [FromQuery] string? desde,
        [FromQuery] string? hasta,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = 20,
        CancellationToken ct = default)
    {
        // 1. Parseo y validación de formato de fechas
        DateTime? fechaDesde = null;
        if (!string.IsNullOrWhiteSpace(desde))
        {
            if (!DateTime.TryParse(desde, CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
            {
                return BadRequest(new
                {
                    codigo = "formato_fecha_invalido",
                    message = "El formato de la fecha 'desde' no es válido.",
                    mensaje = "El formato de la fecha 'desde' no es válido."
                });
            }
            fechaDesde = d.Date;
        }

        DateTime? fechaHasta = null;
        if (!string.IsNullOrWhiteSpace(hasta))
        {
            if (!DateTime.TryParse(hasta, CultureInfo.InvariantCulture, DateTimeStyles.None, out var h))
            {
                return BadRequest(new
                {
                    codigo = "formato_fecha_invalido",
                    message = "El formato de la fecha 'hasta' no es válido.",
                    mensaje = "El formato de la fecha 'hasta' no es válido."
                });
            }
            fechaHasta = h.Date;
        }

        // 2. Validación de regla de negocio temporal (RV-130, MSG-188)
        var hoyLima = TimeZoneHelper.ObtenerFechaActualLima();

        if (fechaDesde.HasValue && fechaHasta.HasValue && fechaDesde.Value > fechaHasta.Value)
        {
            return BadRequest(new
            {
                codigo = "rango_invalido",
                message = MensajesCatalogo.MSG_188,
                mensaje = MensajesCatalogo.MSG_188
            });
        }

        if ((fechaDesde.HasValue && DateOnly.FromDateTime(fechaDesde.Value) > hoyLima) ||
            (fechaHasta.HasValue && DateOnly.FromDateTime(fechaHasta.Value) > hoyLima))
        {
            return BadRequest(new
            {
                codigo = "fecha_futura",
                message = MensajesCatalogo.MSG_188,
                mensaje = MensajesCatalogo.MSG_188
            });
        }

        var resultado = await _cajaService.ObtenerHistorialCierresAsync(fechaDesde, fechaHasta, pagina, tamano, ct);
        return Ok(resultado);
    }

    /// <summary>
    /// CUS 13.3 / Vista 13.4 / HU36 / RN-113: Detalle modal completo de un cierre histórico con platos y ajustes posteriores. Solo Administrador.
    /// </summary>
    [HttpGet("cierres/{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ObtenerDetalleCierre([FromRoute] Guid id, CancellationToken ct)
    {
        var detalle = await _cajaService.ObtenerDetalleCierreAsync(id, ct);
        return Ok(detalle);
    }

    /// <summary>
    /// CUS 13.2 / HU35 / RNF-48 / E-307: Descarga de reporte PDF de 1 página con balance de cierre y firmas.
    /// </summary>
    [HttpGet("cierres/{id:guid}/pdf")]
    [Authorize(Roles = "Cajero,Administrador")]
    public async Task<IActionResult> DescargarCierrePdf([FromRoute] Guid id, CancellationToken ct)
    {
        var pdfBytes = await _pdfCierreService.GenerarVoucherCierreAsync(id, ct);
        var filename = $"Cierre_Caja_{id}.pdf";
        return File(pdfBytes, "application/pdf", filename);
    }

    /// <summary>
    /// Endpoint de compatibilidad hacia atrás para consulta de estado de caja.
    /// </summary>
    [HttpGet("estado")]
    [Authorize(Roles = "Cajero,Administrador")]
    public async Task<IActionResult> ObtenerEstado(CancellationToken ct)
    {
        var estado = await _cajaService.ObtenerEstadoCajaAsync(ct);
        return Ok(estado);
    }

    // ==========================================
    // Métodos Auxiliares de Seguridad y Claims
    // ==========================================

    private Guid ObtenerUsuarioId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("sub");

        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }

    private string ObtenerNombreUsuario()
    {
        return User.FindFirstValue("nombreCompleto")
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("usuario")
            ?? "Cajero";
    }
}
