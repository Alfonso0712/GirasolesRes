using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Productos;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;
    private readonly ILogger<ProductosController> _logger;

    public ProductosController(IProductoService productoService, ILogger<ProductosController> logger)
    {
        _productoService = productoService;
        _logger = logger;
    }

    /// <summary>
    /// CUS04.2 / RF-11: Listar y buscar productos con filtros y paginación
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Listar(
        [FromQuery] string? busqueda,
        [FromQuery] string? categoria,
        [FromQuery] string? tipo,
        [FromQuery] string? rol,
        [FromQuery] bool? estado,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var resultado = await _productoService.ListarProductosAsync(
                busqueda,
                categoria,
                tipo,
                rol,
                estado,
                pagina <= 0 ? 1 : pagina,
                tamano <= 0 ? 10 : tamano,
                cancellationToken);

            if (!resultado.Success)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = resultado.Message
                });
            }

            return Ok(resultado.Data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al listar productos.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = MensajesCatalogo.MSG_67,
                detail = ex.Message
            });
        }
    }

    /// <summary>
    /// CUS04: Obtener datos de un producto por Id
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken cancellationToken = default)
    {
        var resultado = await _productoService.ObtenerPorIdAsync(id, cancellationToken);
        if (!resultado.Success)
        {
            return NotFound(new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS04.1 / RF-10: Registrar producto de la carta
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Registrar(
        [FromBody] CrearProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
        {
            return BadRequest(new { success = false, message = MensajesCatalogo.MSG_51 });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de producto inválidos.",
                errors = ModelState
            });
        }

        var adminUsername = ObtenerNombreAdmin();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _productoService.RegistrarProductoAsync(request, adminUsername, ipAddress, cancellationToken);

        if (!resultado.Success)
        {
            if (resultado.Message == MensajesCatalogo.MSG_53)
            {
                return Conflict(new
                {
                    success = false,
                    message = resultado.Message,
                    errors = resultado.Errors
                });
            }

            return BadRequest(new
            {
                success = false,
                message = resultado.Message,
                errors = resultado.Errors,
                detail = resultado.Detail
            });
        }

        return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Data!.Id }, resultado.Data);
    }

    /// <summary>
    /// CUS04.3 / RF-12: Editar nombre, categoría o precio de un producto
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Actualizar(
        Guid id,
        [FromBody] ActualizarProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
        {
            return BadRequest(new { success = false, message = MensajesCatalogo.MSG_51 });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de producto inválidos.",
                errors = ModelState
            });
        }

        var adminUsername = ObtenerNombreAdmin();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _productoService.ActualizarProductoAsync(id, request, adminUsername, ipAddress, cancellationToken);

        if (!resultado.Success)
        {
            if (resultado.Message == MensajesCatalogo.MSG_53)
            {
                return Conflict(new
                {
                    success = false,
                    message = resultado.Message,
                    errors = resultado.Errors
                });
            }

            if (resultado.Message == MensajesCatalogo.MSG_38 && resultado.Errors == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = resultado.Message
                });
            }

            return BadRequest(new
            {
                success = false,
                message = resultado.Message,
                errors = resultado.Errors,
                detail = resultado.Detail
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS04.4 / RF-13: Activar o desactivar producto
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
        {
            return BadRequest(new { success = false, message = MensajesCatalogo.MSG_38 });
        }

        var adminUsername = ObtenerNombreAdmin();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _productoService.CambiarEstadoAsync(id, request.Activo, adminUsername, ipAddress, cancellationToken);

        if (!resultado.Success)
        {
            return NotFound(new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS04 Contrato API: Listar productos disponibles (solo activos)
    /// Accesible para Administrador, Cajero, Mozo y Cocinero para menú del día y pedidos
    /// </summary>
    [HttpGet("disponibles")]
    [Authorize(Roles = "Administrador,Cajero,Mozo,Cocinero")]
    public async Task<IActionResult> ListarDisponibles(
        [FromQuery] string? categoria,
        [FromQuery] string? tipo,
        [FromQuery] string? rol,
        CancellationToken cancellationToken = default)
    {
        var resultado = await _productoService.ListarDisponiblesAsync(categoria, tipo, rol, cancellationToken);
        if (!resultado.Success)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(resultado.Data);
    }

    private string ObtenerNombreAdmin()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value 
            ?? User.FindFirst("nombre_usuario")?.Value 
            ?? User.Identity?.Name 
            ?? "admin";
    }
}
