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
        if (!string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase))
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
    /// CUS09.1: Listar pedidos con su estado y contadores de resumen (Vistas 9.1 y 9.2).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ListarPedidos(
        [FromQuery] ListarPedidosQueryDto query,
        CancellationToken cancellationToken)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        try
        {
            var resultado = await _pedidoService.ListarPedidosAsync(query, usuarioId, rol, cancellationToken);
            return Ok(resultado);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al listar pedidos.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_114 });
        }
    }

    /// <summary>
    /// CUS09.1: Consulta el detalle completo de un pedido por ID (Vista 9.2). Roles: Administrador, Cajero, Mozo.
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

        var pedido = await _pedidoService.ObtenerDetalleCompletoAsync(id, cancellationToken);
        if (pedido == null)
        {
            return NotFound(new { message = "Pedido no encontrado." });
        }

        return Ok(pedido);
    }

    /// <summary>
    /// CUS09.2: Modificar pedido (Vista 9.3). Roles: Mozo y Cajero (solo creador, todas comandas pendientes).
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> ModificarPedido(
        Guid id,
        [FromBody] ModificarPedidoRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_38, errors = ModelState });
        }

        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Usuario";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var total = await _pedidoService.ModificarPedidoAsync(
                id,
                request,
                usuarioId,
                rol,
                nombreUsuario,
                ip,
                cancellationToken);

            return Ok(new { total });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
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
            _logger.LogError(ex, "Error al modificar pedido {PedidoId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_122 });
        }
    }

    /// <summary>
    /// CUS09.2: Anular pedido (Vista 9.4). Roles: Mozo y Cajero (solo creador, todas comandas pendientes).
    /// </summary>
    [HttpPost("{id:guid}/anular")]
    public async Task<IActionResult> AnularPedido(
        Guid id,
        [FromBody] AnularPedidoRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_38, errors = ModelState });
        }

        var rol = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Usuario";
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            await _pedidoService.AnularPedidoAsync(
                id,
                request,
                usuarioId,
                rol,
                nombreUsuario,
                ip,
                cancellationToken);

            return Ok(new { success = true, message = MensajesCatalogo.MSG_120 });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
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
            _logger.LogError(ex, "Error al anular pedido {PedidoId}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_122 });
        }
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
    /// Obtiene todos los pedidos abiertos de una mesa específica para alimentar MSG-95.
    /// </summary>
    [HttpGet("mesa/{mesaId:guid}/activo")]
    public async Task<IActionResult> ObtenerActivoPorMesa(Guid mesaId, CancellationToken cancellationToken)
    {
        var pedidos = await _pedidoService.ObtenerPedidosActivosPorMesaAsync(mesaId, cancellationToken);
        return Ok(pedidos);
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
