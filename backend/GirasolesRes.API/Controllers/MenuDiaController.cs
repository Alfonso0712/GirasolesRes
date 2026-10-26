using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenuDia;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/menu-dia")]
[Authorize]
public class MenuDiaController : ControllerBase
{
    private readonly IMenuDiaService _menuDiaService;
    private readonly ILogger<MenuDiaController> _logger;

    public MenuDiaController(IMenuDiaService menuDiaService, ILogger<MenuDiaController> logger)
    {
        _menuDiaService = menuDiaService;
        _logger = logger;
    }

    /// <summary>
    /// CUS05 / RF-14, RF-15: Consultar menú del día actual (hora de Lima).
    /// Accesible para Administrador, Cocinero, Mozo y Cajero (CUS07 y CUS08).
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Administrador,Cajero,Mozo,Cocinero")]
    public async Task<IActionResult> ObtenerMenuHoy(CancellationToken cancellationToken)
    {
        var resultado = await _menuDiaService.ObtenerMenuHoyAsync(cancellationToken);
        if (!resultado.IsSuccess)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = resultado.Message,
                detail = resultado.Detail
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS05.1: Obtener productos candidatos activos para definir el menú.
    /// Exclusivo para Administrador.
    /// </summary>
    [HttpGet("candidatos")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ObtenerCandidatos(CancellationToken cancellationToken)
    {
        var resultado = await _menuDiaService.ObtenerCandidatosAsync(cancellationToken);
        if (!resultado.IsSuccess)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = resultado.Message,
                detail = resultado.Detail
            });
        }

        return Ok(resultado.Data);
    }

    /// <summary>
    /// CUS05.1 / RF-14 / HU14: Guardar o actualizar la definición del menú de hoy.
    /// Exclusivo para Administrador.
    /// </summary>
    [HttpPut("hoy")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> GuardarMenuHoy([FromBody] GuardarMenuDiaRequest request, CancellationToken cancellationToken)
    {
        var username = ObtenerNombreUsuario();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _menuDiaService.GuardarMenuHoyAsync(request, username, ipAddress, cancellationToken);
        if (!resultado.IsSuccess)
        {
            return BadRequest(new
            {
                success = false,
                message = resultado.Message,
                detail = resultado.Detail
            });
        }

        return Ok(new
        {
            success = true,
            message = resultado.Message,
            data = resultado.Data
        });
    }

    /// <summary>
    /// CUS05.2 / RF-15 / HU15: Cambiar disponibilidad de un plato del menú (Agotado / Disponible).
    /// Accesible para Administrador y Cocinero.
    /// </summary>
    [HttpPatch("hoy/platos/{productoId:guid}/disponibilidad")]
    [Authorize(Roles = "Administrador,Cocinero")]
    public async Task<IActionResult> CambiarDisponibilidad(
        [FromRoute] Guid productoId,
        [FromBody] CambiarDisponibilidadRequest request,
        CancellationToken cancellationToken)
    {
        var username = ObtenerNombreUsuario();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _menuDiaService.CambiarDisponibilidadAsync(
            productoId,
            request.Agotado,
            username,
            ipAddress,
            cancellationToken);

        if (!resultado.IsSuccess)
        {
            if (resultado.Message == MensajesCatalogo.MSG_79 || resultado.Message.Contains("no forma parte"))
            {
                return NotFound(new
                {
                    success = false,
                    message = resultado.Message,
                    detail = resultado.Detail
                });
            }

            return BadRequest(new
            {
                success = false,
                message = resultado.Message,
                detail = resultado.Detail
            });
        }

        return Ok(new
        {
            success = true,
            message = resultado.Message,
            data = resultado.Data
        });
    }

    private string ObtenerNombreUsuario()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst("nombre_usuario")?.Value
            ?? User.Identity?.Name
            ?? "usuario";
    }
}
