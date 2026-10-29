using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Perfil;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PerfilController : ControllerBase
{
    private readonly IPerfilService _perfilService;
    private readonly ILogger<PerfilController> _logger;

    public PerfilController(IPerfilService perfilService, ILogger<PerfilController> logger)
    {
        _perfilService = perfilService;
        _logger = logger;
    }

    /// <summary>
    /// HU-09 / RF-07: Cambiar propia contraseña desde la barra superior (Solo Administrador)
    /// </summary>
    [Authorize]
    [HttpPut("contrasena")]
    public async Task<IActionResult> CambiarContrasena(
        [FromBody] CambiarContrasenaPropiaRequest request,
        CancellationToken cancellationToken)
    {
        // RN-16: Solo el Administrador puede cambiar su contraseña desde la barra superior
        var rol = User.FindFirstValue(ClaimTypes.Role);
        if (rol != "Administrador")
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                success = false,
                message = MensajesCatalogo.MSG_49
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de contraseña inválidos.",
                errors = ModelState
            });
        }

        var usuario = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("usuario") ?? "";
        var jti = User.FindFirstValue(JwtRegisteredClaimNames.Jti);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        var expClaim = User.FindFirstValue(JwtRegisteredClaimNames.Exp);
        DateTime expUtc = DateTime.UtcNow.AddMinutes(30);
        if (long.TryParse(expClaim, out var expSeconds))
        {
            expUtc = DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime;
        }

        var resultado = await _perfilService.CambiarContrasenaPropiaAsync(
            usuario,
            request,
            jti,
            expUtc,
            ip,
            cancellationToken);

        if (resultado.IsSuccess)
        {
            // RN-22: Se entrega el nuevo token JWT para que la sesión continúe sin interrupción
            return Ok(new
            {
                success = true,
                message = resultado.Message,
                token = resultado.Data
            });
        }

        // RN-17: Cinco intentos consecutivos con contraseña actual incorrecta cierran la sesión (423 Locked)
        if (resultado.Message == MensajesCatalogo.MSG_48)
        {
            return StatusCode(StatusCodes.Status423Locked, new
            {
                success = false,
                message = resultado.Message
            });
        }

        // RV-26 / RN-18: Nueva contraseña igual a la actual (MSG-46)
        if (resultado.Message == MensajesCatalogo.MSG_46)
        {
            return BadRequest(new
            {
                success = false,
                message = resultado.Message,
                field = "nuevaContrasena",
                errors = new Dictionary<string, string[]>
                {
                    { "nuevaContrasena", new[] { MensajesCatalogo.MSG_46 } }
                }
            });
        }

        // RV-30: Contraseña actual incorrecta (MSG-45)
        if (resultado.Message == MensajesCatalogo.MSG_45)
        {
            return BadRequest(new
            {
                success = false,
                message = resultado.Message,
                field = "contrasenaActual",
                errors = new Dictionary<string, string[]>
                {
                    { "contrasenaActual", new[] { MensajesCatalogo.MSG_45 } }
                }
            });
        }

        // RV-16: Rol no permitido (MSG-49)
        if (resultado.Message == MensajesCatalogo.MSG_49)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
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

    /// <summary>
    /// Actualizar preferencia de tema visual (light / dark) del usuario autenticado
    /// </summary>
    [Authorize]
    [HttpPatch("tema")]
    public async Task<IActionResult> ActualizarTema(
        [FromBody] ActualizarTemaRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de tema inválidos.",
                errors = ModelState
            });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var temaNormalizado = (request.Tema ?? string.Empty).Trim().ToLowerInvariant();
        await _perfilService.ActualizarTemaAsync(usuarioId, temaNormalizado, cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Tema actualizado.",
            data = new
            {
                tema = temaNormalizado
            }
        });
    }

    /// <summary>
    /// Actualizar preferencia de orientación de interfaz (right / left) del usuario autenticado
    /// </summary>
    [Authorize]
    [HttpPatch("orientacion")]
    public async Task<IActionResult> ActualizarOrientacion(
        [FromBody] ActualizarOrientacionRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de orientación inválidos.",
                errors = ModelState
            });
        }

        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { message = "Token inválido o expirado." });
        }

        var orientacionNormalizada = (request.Orientacion ?? string.Empty).Trim().ToLowerInvariant();
        await _perfilService.ActualizarOrientacionAsync(usuarioId, orientacionNormalizada, cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Orientación actualizada.",
            data = new
            {
                orientacion = orientacionNormalizada
            }
        });
    }
}
