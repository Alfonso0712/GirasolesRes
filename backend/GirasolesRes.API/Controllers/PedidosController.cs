using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly IPedidoService _pedidoService;
    private readonly ILogger<PedidosController> _logger;

    public PedidosController(
        IPedidoService pedidoService,
        ILogger<PedidosController> logger)
    {
        _pedidoService = pedidoService;
        _logger = logger;
    }

    /// <summary>
    /// CUS07.1: Registra un pedido de mesa (Vistas 7.1 y 7.2). Rol requerido: Mozo.
    /// </summary>
    [HttpPost("mesa")]
    public async Task<IActionResult> RegistrarPedidoMesa(
        [FromBody] RegistrarPedidoMesaRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_38, errors = ModelState });
        }

        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Mozo";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var resultado = await _pedidoService.RegistrarPedidoMesaAsync(
                request,
                nombreUsuario,
                usuarioId,
                ip,
                cancellationToken);

            return StatusCode(StatusCodes.Status201Created, resultado);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (PedidoConflictException ex)
        {
            return Conflict(new
            {
                codigo = ex.Codigo,
                message = ex.Message,
                productosAgotados = ex.ProductosAgotados
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al registrar pedido de mesa.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_105 });
        }
    }

    /// <summary>
    /// CUS08: Registra un pedido para llevar (Vistas 8.1 y 8.2). Rol requerido: Cajero.
    /// </summary>
    [HttpPost("llevar")]
    public async Task<IActionResult> RegistrarPedidoLlevar(
        [FromBody] RegistrarPedidoLlevarRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_38, errors = ModelState });
        }

        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Cajero";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var resultado = await _pedidoService.RegistrarPedidoLlevarAsync(
                request,
                nombreUsuario,
                usuarioId,
                ip,
                cancellationToken);

            return StatusCode(StatusCodes.Status201Created, resultado);
        }
        catch (PedidoConflictException ex)
        {
            return Conflict(new
            {
                codigo = ex.Codigo,
                message = ex.Message,
                productosAgotados = ex.ProductosAgotados
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al registrar pedido para llevar.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_111 });
        }
    }

    /// <summary>
    /// Consulta el detalle completo de un pedido por ID. Roles: Administrador, Cajero, Mozo.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken cancellationToken)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var pedido = await _pedidoService.ObtenerPedidoPorIdAsync(id, cancellationToken);
        if (pedido == null)
        {
            return NotFound(new { message = "Pedido no encontrado." });
        }

        return Ok(pedido);
    }

    /// <summary>
    /// CUS07.2: Agrega productos a un pedido existente (Vista 7.3). Rol requerido: Mozo.
    /// </summary>
    [HttpPost("{id:guid}/lineas")]
    public async Task<IActionResult> AgregarLineas(
        Guid id,
        [FromBody] AgregarLineasPedidoRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_38, errors = ModelState });
        }

        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Mozo", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(rol, "Administrador", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Mozo";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var resultado = await _pedidoService.AgregarLineasAsync(
                id,
                request,
                nombreUsuario,
                usuarioId,
                ip,
                cancellationToken);

            return Ok(resultado);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (PedidoConflictException ex)
        {
            return Conflict(new
            {
                codigo = ex.Codigo,
                message = ex.Message,
                productosAgotados = ex.ProductosAgotados
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al agregar líneas a pedido {PedidoId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_106 });
        }
    }

    /// <summary>
    /// Obtiene el pedido activo de una mesa específica (si lo tuviera).
    /// </summary>
    [HttpGet("mesa/{mesaId:guid}/activo")]
    public async Task<IActionResult> ObtenerActivoPorMesa(Guid mesaId, CancellationToken cancellationToken)
    {
        var pedido = await _pedidoService.ObtenerPedidoActivoPorMesaAsync(mesaId, cancellationToken);
        if (pedido == null)
        {
            return NotFound(new { message = "No hay pedido activo en esta mesa." });
        }

        return Ok(pedido);
    }

    /// <summary>
    /// Obtiene los productos disponibles para toma de pedidos (del menú del día o todos los activos según RN-35).
    /// </summary>
    [HttpGet("catalogo-pedido")]
    public async Task<IActionResult> ObtenerCatalogoPedido(CancellationToken cancellationToken)
    {
        var productos = await _pedidoService.ObtenerMenuParaPedidoAsync(cancellationToken);
        return Ok(productos);
    }
}
