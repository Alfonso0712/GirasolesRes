using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Auth;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IPerfilService _perfilService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IPerfilService perfilService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _perfilService = perfilService;
        _logger = logger;
    }

    /// <summary>
    /// CUS01.1: Inicio de sesión con validación de ModelState y respuestas HTTP estructuradas
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        // Semana 06: Validación defensiva del ModelState
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de entrada inválidos.",
                errors = ModelState
            });
        }

        // Semana 07: Normalización de cadenas
        request.Usuario = request.Usuario.Trim();

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var resultado = await _authService.IniciarSesionAsync(request, ip, cancellationToken);

        if (resultado.IsSuccess)
        {
            // Semana 07 y 08: Respuesta HTTP estructurada
            return Ok(new
            {
                success = true,
                message = resultado.Message,
                data = resultado.Data
            });
        }

        // Mapeo estructurado según la razón de fallo
        if (resultado.Message == MensajesCatalogo.MSG_05)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                success = false,
                message = resultado.Message
            });
        }

        if (resultado.Message == MensajesCatalogo.MSG_06)
        {
            return StatusCode(StatusCodes.Status423Locked, new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Unauthorized(new
        {
            success = false,
            message = resultado.Message,
            errors = resultado.Errors
        });
    }

    /// <summary>
    /// CUS01.2: Solicitar código de recuperación de contraseña
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = MensajesCatalogo.MSG_12,
                errors = ModelState
            });
        }

        request.Correo = request.Correo.Trim();
        var resultado = await _authService.SolicitarRecuperacionPasswordAsync(request, cancellationToken);

        if (resultado.IsSuccess)
        {
            return Ok(new
            {
                success = true,
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
    /// CUS01.2: Restablecer contraseña con código de 6 dígitos
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de restablecimiento inválidos.",
                errors = ModelState
            });
        }

        request.Correo = request.Correo.Trim();
        request.Codigo = request.Codigo.Trim();

        var resultado = await _authService.RestablecerPasswordAsync(request, cancellationToken);

        if (resultado.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                message = resultado.Message
            });
        }

        return BadRequest(new
        {
            success = false,
            message = resultado.Message
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var tema = "light";
        var orientacion = "right";
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(usuarioIdClaim, out var usuarioId))
        {
            tema = await _perfilService.ObtenerTemaAsync(usuarioId, cancellationToken);
            orientacion = await _perfilService.ObtenerOrientacionAsync(usuarioId, cancellationToken);
        }

        return Ok(new
        {
            success = true,
            usuario = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("usuario"),
            nombre = User.FindFirstValue("nombreCompleto"),
            rol = User.FindFirstValue(ClaimTypes.Role),
            email = User.FindFirstValue(ClaimTypes.Email),
            tema,
            orientacion
        });
    }

    /// <summary>
    /// HU-08 / RF-02: Cierre de sesión (manual, inactividad o expiración) con revocación de token (RN-19, RN-21)
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest? request, CancellationToken cancellationToken)
    {
        try
        {
            var jti = User.FindFirstValue(JwtRegisteredClaimNames.Jti);
            var usuario = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("usuario") ?? "usuario";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var motivo = string.IsNullOrWhiteSpace(request?.Motivo) ? "manual" : request.Motivo.Trim();

            // Determinar fecha de expiración del token actual para limpieza
            var expClaim = User.FindFirstValue(JwtRegisteredClaimNames.Exp);
            DateTime expUtc = DateTime.UtcNow.AddMinutes(30);
            if (long.TryParse(expClaim, out var expSeconds))
            {
                expUtc = DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime;
            }

            if (!string.IsNullOrEmpty(jti))
            {
                await _authService.LogoutAsync(jti, usuario, motivo, expUtc, ip, cancellationToken);
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar cierre de sesión.");
            // En caso de fallo de servidor, cliente asume cierre de sesión local (E-45, MSG-50)
            return NoContent();
        }
    }

    /// <summary>
    /// HU-08 / RN-20 / RV-32: Renovar token JWT (acción CONTINUAR a los 28 minutos de inactividad)
    /// </summary>
    [Authorize]
    [HttpPost("renovar")]
    public async Task<IActionResult> RenovarToken(CancellationToken cancellationToken)
    {
        var usuario = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("usuario");
        if (string.IsNullOrEmpty(usuario))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Sesión vencida."
            });
        }

        var resultado = await _authService.RenovarTokenAsync(usuario, cancellationToken);
        if (!resultado.IsSuccess)
        {
            return Unauthorized(new
            {
                success = false,
                message = resultado.Message
            });
        }

        return Ok(new
        {
            token = resultado.Data
        });
    }
}
