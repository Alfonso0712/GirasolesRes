using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Mesas;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MesasController : ControllerBase
{
    private readonly IMesaService _mesaService;
    private readonly ILogger<MesasController> _logger;

    public MesasController(IMesaService mesaService, ILogger<MesasController> logger)
    {
        _mesaService = mesaService;
        _logger = logger;
    }

    /// <summary>
    /// CUS06.2 / RF-17: Listar todas las mesas activas para Salón (Mozo/Cajero)
    /// o todas (activas e inactivas) para Administración (RN-40)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Administrador,Cajero,Mozo")]
    public async Task<IActionResult> Listar(
        [FromQuery] string? estado,
        [FromQuery] bool incluirInactivas = false,
        CancellationToken cancellationToken = default)
    {
        var rol = ObtenerRolUsuario();
        var resultado = await _mesaService.ListarMesasAsync(estado, incluirInactivas, rol, cancellationToken);

        if (!resultado.Success)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = resultado.Message
            });
        }

        // Contrato API CUS06: Retorna lista de mesas en orden natural
        return Ok(resultado.Data);
    }

    /// <summary>
    /// Resumen de ocupación y vigencia de mesas (Libres X · Ocupadas Y)
    /// </summary>
    [HttpGet("resumen")]
    [Authorize(Roles = "Administrador,Cajero,Mozo")]
    public async Task<IActionResult> ObtenerResumen(CancellationToken cancellationToken)
    {
        var resultado = await _mesaService.ObtenerResumenAsync(cancellationToken);
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

    /// <summary>
    /// CUS06.1 / RF-16: Registrar nueva mesa activa y libre
    /// Rol: Administrador (RN-39)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Crear([FromBody] CrearMesaRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var primerError = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault() ?? MensajesCatalogo.MSG_81;

            return BadRequest(new
            {
                success = false,
                message = primerError,
                errors = ModelState
            });
        }

        var adminUser = ObtenerNombreUsuario();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _mesaService.RegistrarMesaAsync(request, adminUser, ip, cancellationToken);

        if (resultado.Success && resultado.Data is not null)
        {
            return StatusCode(StatusCodes.Status201Created, new
            {
                id = resultado.Data.Id,
                nombre = resultado.Data.Nombre,
                ocupacion = resultado.Data.Ocupacion,
                activa = resultado.Data.Activa,
                success = true,
                message = resultado.Message
            });
        }

        // Conflicto por nombre duplicado (RV-52, MSG-83)
        if (resultado.Message == MensajesCatalogo.MSG_83)
        {
            return Conflict(new
            {
                success = false,
                message = resultado.Message
            });
        }

        // Validación de nombre inválido (RV-51, MSG-81, MSG-82)
        if (resultado.Message == MensajesCatalogo.MSG_81 || resultado.Message == MensajesCatalogo.MSG_82)
        {
            return BadRequest(new
            {
                success = false,
                message = resultado.Message
            });
        }

        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
            success = false,
            message = resultado.Message
        });
    }

    /// <summary>
    /// CUS06.3 / RF-18: Editar número o nombre de mesa
    /// Rol: Administrador (RN-39)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarMesaRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var primerError = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault() ?? MensajesCatalogo.MSG_81;

            return BadRequest(new
            {
                success = false,
                message = primerError,
                errors = ModelState
            });
        }

        var adminUser = ObtenerNombreUsuario();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _mesaService.ActualizarMesaAsync(id, request, adminUser, ip, cancellationToken);

        if (resultado.Success && resultado.Data is not null)
        {
            return Ok(new
            {
                id = resultado.Data.Id,
                nombre = resultado.Data.Nombre,
                ocupacion = resultado.Data.Ocupacion,
                activa = resultado.Data.Activa,
                success = true,
                message = resultado.Message
            });
        }

        if (resultado.Message == "La mesa no existe.")
        {
            return NotFound(new
            {
                success = false,
                message = resultado.Message
            });
        }

        // Conflicto por nombre duplicado (RV-52, MSG-83)
        if (resultado.Message == MensajesCatalogo.MSG_83)
        {
            return Conflict(new
            {
                success = false,
                message = resultado.Message
            });
        }

        // Validación de nombre inválido (RV-51, MSG-81, MSG-82)
        if (resultado.Message == MensajesCatalogo.MSG_81 || resultado.Message == MensajesCatalogo.MSG_82)
        {
            return BadRequest(new
            {
                success = false,
                message = resultado.Message
            });
        }

        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
            success = false,
            message = resultado.Message
        });
    }

    /// <summary>
    /// CUS06.3 / RF-18: Activar o desactivar vigencia de la mesa
    /// Rol: Administrador (RN-39)
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] CambiarEstadoMesaRequest request, CancellationToken cancellationToken)
    {
        var adminUser = ObtenerNombreUsuario();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        var resultado = await _mesaService.CambiarEstadoAsync(id, request.Activa, adminUser, ip, cancellationToken);

        if (resultado.Success && resultado.Data is not null)
        {
            return Ok(new
            {
                id = resultado.Data.Id,
                nombre = resultado.Data.Nombre,
                ocupacion = resultado.Data.Ocupacion,
                activa = resultado.Data.Activa,
                success = true,
                message = resultado.Message
            });
        }

        if (resultado.Message == "La mesa no existe.")
        {
            return NotFound(new
            {
                success = false,
                message = resultado.Message
            });
        }

        // RV-56 / RN-44: Mesa ocupada al desactivar -> 409 con MSG-88
        if (resultado.Message.StartsWith("No se puede desactivar", StringComparison.OrdinalIgnoreCase))
        {
            return Conflict(new
            {
                success = false,
                message = resultado.Message
            });
        }

        return BadRequest(new
        {
            success = false,
            message = resultado.Message
        });
    }

    private string ObtenerNombreUsuario()
    {
        return User.FindFirstValue(ClaimTypes.Name) ??
               User.FindFirstValue("usuario") ??
               User.Identity?.Name ??
               "admin";
    }

    private string ObtenerRolUsuario()
    {
        return User.FindFirstValue(ClaimTypes.Role) ??
               User.FindFirstValue("rol") ??
               "Mozo";
    }
}
