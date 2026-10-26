using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Comandas;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComandasController : ControllerBase
{
    private readonly IComandaService _comandaService;
    private readonly ILogger<ComandasController> _logger;

    public ComandasController(
        IComandaService comandaService,
        ILogger<ComandasController> logger)
    {
        _comandaService = comandaService;
        _logger = logger;
    }

    /// <summary>
    /// CUS10.2: Consulta de comandas para la pantalla de cocina (KDS). Rol: Cocinero.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ListarComandas([FromQuery] string? estado)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cocinero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        try
        {
            var res = await _comandaService.ListarComandasAsync(estado);
            return Ok(res);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al listar comandas para cocina.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_125 });
        }
    }

    /// <summary>
    /// CUS10.3: Actualizar estado de comanda (enPreparacion o lista). Rol: Cocinero.
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    public async Task<IActionResult> ActualizarEstado(
        [FromRoute] Guid id,
        [FromBody] ActualizarEstadoComandaRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = MensajesCatalogo.MSG_38, errors = ModelState });
        }

        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cocinero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Cocinero";

        try
        {
            var res = await _comandaService.ActualizarEstadoAsync(id, request, nombreUsuario);
            return Ok(res);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "La comanda no existe." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar estado de la comanda {ComandaId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_131 });
        }
    }

    /// <summary>
    /// CUS10.3: Deshacer cambio de estado dentro de los 10 segundos. Rol: Cocinero.
    /// </summary>
    [HttpPost("{id:guid}/deshacer")]
    public async Task<IActionResult> DeshacerEstado([FromRoute] Guid id)
    {
        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (!string.Equals(rol, "Cocinero", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = MensajesCatalogo.MSG_39 });
        }

        var nombreUsuario = User.FindFirstValue(ClaimTypes.Name) ?? "Cocinero";

        try
        {
            var res = await _comandaService.DeshacerEstadoAsync(id, nombreUsuario);
            return Ok(res);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "La comanda no existe." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al deshacer estado de la comanda {ComandaId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = MensajesCatalogo.MSG_131 });
        }
    }
}
