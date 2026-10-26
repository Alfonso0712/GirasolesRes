using System.Security.Claims;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Usuarios;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(IUsuarioService usuarioService, ILogger<UsuariosController> logger)
    {
        _usuarioService = usuarioService;
        _logger = logger;
    }

    /// <summary>
    /// HU-03 / RF-04: Listar y buscar usuarios con paginación y filtros
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] string? busqueda,
        [FromQuery] string? rol,
        [FromQuery] bool? estado,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var resultado = await _usuarioService.ListarUsuariosAsync(
                busqueda,
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
            _logger.LogError(ex, "Error no controlado al listar usuarios.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = MensajesCatalogo.MSG_37,
                detail = ex.Message
            });
        }
    }

    /// <summary>
    /// HU-05 / RF-05: Obtener datos de un usuario por Id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObtenerPorId(Guid id, CancellationToken cancellationToken)
    {
        var resultado = await _usuarioService.ObtenerPorIdAsync(id, cancellationToken);
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
    /// HU-04 / RF-03: Registrar nuevo usuario
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] CrearUsuarioRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de usuario inválidos.",
                errors = ModelState
            });
        }

        try
        {
            var adminUser = ObtenerNombreAdmin();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

            var resultado = await _usuarioService.RegistrarUsuarioAsync(request, adminUser, ip, cancellationToken);

            if (resultado.Success)
            {
                return StatusCode(StatusCodes.Status201Created, new
                {
                    success = true,
                    message = resultado.Message,
                    data = resultado.Data
                });
            }

            // Conflicto de usuario o correo duplicado (MSG-21, MSG-24)
            if (resultado.Message == MensajesCatalogo.MSG_21 || resultado.Message == MensajesCatalogo.MSG_24)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar usuario.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = MensajesCatalogo.MSG_38,
                detail = ex.Message
            });
        }
    }

    /// <summary>
    /// HU-05 / RF-05: Editar datos, rol y contraseña opcional de un usuario
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarUsuarioRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Datos de edición inválidos.",
                errors = ModelState
            });
        }

        try
        {
            var adminUser = ObtenerNombreAdmin();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

            var resultado = await _usuarioService.ActualizarUsuarioAsync(id, request, adminUser, ip, cancellationToken);

            if (resultado.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = resultado.Message,
                    data = resultado.Data
                });
            }

            if (resultado.Message == "Usuario no encontrado.")
            {
                return NotFound(new
                {
                    success = false,
                    message = resultado.Message
                });
            }

            // Conflictos por duplicados o protección del último administrador (MSG-21, MSG-24, MSG-32)
            if (resultado.Message == MensajesCatalogo.MSG_21 ||
                resultado.Message == MensajesCatalogo.MSG_24 ||
                resultado.Message == MensajesCatalogo.MSG_32)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar usuario {Id}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = MensajesCatalogo.MSG_38,
                detail = ex.Message
            });
        }
    }

    /// <summary>
    /// HU-06 / RF-06: Activar o desactivar usuario
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] CambiarEstadoRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var adminUser = ObtenerNombreAdmin();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

            var resultado = await _usuarioService.CambiarEstadoAsync(id, request.Activo, adminUser, ip, cancellationToken);

            if (resultado.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = resultado.Message,
                    data = resultado.Data
                });
            }

            if (resultado.Message == "Usuario no encontrado.")
            {
                return NotFound(new
                {
                    success = false,
                    message = resultado.Message
                });
            }

            // Protección de cuenta propia o último administrador (MSG-31, MSG-32)
            if (resultado.Message == MensajesCatalogo.MSG_31 || resultado.Message == MensajesCatalogo.MSG_32)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar estado del usuario {Id}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = MensajesCatalogo.MSG_38,
                detail = ex.Message
            });
        }
    }

    /// <summary>
    /// HU-07 / RF-09: Eliminar usuario físicamente (si no tiene movimientos)
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var adminUser = ObtenerNombreAdmin();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

            var resultado = await _usuarioService.EliminarUsuarioAsync(id, adminUser, ip, cancellationToken);

            if (resultado.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = resultado.Message
                });
            }

            if (resultado.Message == "Usuario no encontrado.")
            {
                return NotFound(new
                {
                    success = false,
                    message = resultado.Message
                });
            }

            // Conflicto si es propia cuenta, último admin, o tiene movimientos (MSG-31, MSG-32, MSG-34)
            if (resultado.Message == MensajesCatalogo.MSG_31 ||
                resultado.Message == MensajesCatalogo.MSG_32 ||
                resultado.Message == MensajesCatalogo.MSG_34)
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
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "Violación de integridad referencial al eliminar usuario {Id}.", id);
            return Conflict(new
            {
                success = false,
                message = MensajesCatalogo.MSG_34
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar usuario {Id}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = MensajesCatalogo.MSG_38,
                detail = ex.Message
            });
        }
    }

    private string ObtenerNombreAdmin()
    {
        return User.FindFirstValue(ClaimTypes.Name) ??
               User.FindFirstValue("usuario") ??
               User.Identity?.Name ??
               "admin";
    }
}
