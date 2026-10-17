using System.Collections.Concurrent;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Perfil;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class PerfilService : IPerfilService
{
    private static readonly ConcurrentDictionary<string, int> _consecutiveFailedAttempts = new();

    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IAuditoriaUsuarioRepository _auditoriaRepository;
    private readonly ITokenRevocadoRepository _tokenRevocadoRepository;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IJwtGenerator _jwtGenerator;

    public PerfilService(
        IUsuarioRepository usuarioRepository,
        IAuditoriaUsuarioRepository auditoriaRepository,
        ITokenRevocadoRepository tokenRevocadoRepository,
        IPasswordHasherService passwordHasher,
        IJwtGenerator jwtGenerator)
    {
        _usuarioRepository = usuarioRepository;
        _auditoriaRepository = auditoriaRepository;
        _tokenRevocadoRepository = tokenRevocadoRepository;
        _passwordHasher = passwordHasher;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<ApiResponse<string>> CambiarContrasenaPropiaAsync(
        string nombreUsuario,
        CambiarContrasenaPropiaRequest request,
        string? currentJti = null,
        DateTime? currentExp = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var usuario = await _usuarioRepository.ObtenerPorNombreUsuarioAsync(nombreUsuario, cancellationToken);
            if (usuario == null)
            {
                return ApiResponse<string>.Fallido("Usuario no encontrado.");
            }

            // RN-16: Solo el Administrador puede cambiar su contraseña desde la barra superior
            if (usuario.Rol != RolUsuario.Administrador)
            {
                return ApiResponse<string>.Fallido(MensajesCatalogo.MSG_49);
            }

            // Validar contraseña actual
            var passwordValido = _passwordHasher.VerifyPassword(usuario.PasswordHash, request.ContrasenaActual);
            if (!passwordValido)
            {
                // RN-17: Cinco intentos consecutivos con la contraseña actual incorrecta cierran la sesión
                var intentos = _consecutiveFailedAttempts.AddOrUpdate(nombreUsuario.ToLowerInvariant(), 1, (_, count) => count + 1);

                if (intentos >= 5)
                {
                    _consecutiveFailedAttempts.TryRemove(nombreUsuario.ToLowerInvariant(), out _);

                    // Revocar token de la sesión actual
                    if (!string.IsNullOrEmpty(currentJti))
                    {
                        var exp = currentExp ?? DateTime.UtcNow.AddMinutes(30);
                        await _tokenRevocadoRepository.RevocarAsync(currentJti, usuario.NombreUsuario, exp, "INTENTOS_FALLIDOS", cancellationToken);
                    }

                    // Registrar en auditoría (RN-21)
                    var auditoriaCierre = new AuditoriaUsuario(
                        usuario.NombreUsuario,
                        "CIERRE_SESION",
                        usuario.NombreUsuario,
                        "Cierre por 5 intentos fallidos consecutivos al cambiar contraseña",
                        ipAddress);
                    await _auditoriaRepository.RegistrarAsync(auditoriaCierre, cancellationToken);
                    await _auditoriaRepository.GuardarCambiosAsync(cancellationToken);

                    return ApiResponse<string>.Fallido(MensajesCatalogo.MSG_48);
                }

                return ApiResponse<string>.Fallido(MensajesCatalogo.MSG_45);
            }

            // RV-26 / RN-18: La nueva contraseña debe ser distinta de la actual
            if (_passwordHasher.VerifyPassword(usuario.PasswordHash, request.NuevaContrasena))
            {
                return ApiResponse<string>.Fallido(MensajesCatalogo.MSG_46);
            }

            // Reiniciar intentos fallidos consecutivos
            _consecutiveFailedAttempts.TryRemove(nombreUsuario.ToLowerInvariant(), out _);

            // RNF-10: Hash de la nueva contraseña con PBKDF2
            var nuevoHash = _passwordHasher.HashPassword(request.NuevaContrasena);
            usuario.ActualizarPassword(nuevoHash);

            await _usuarioRepository.ActualizarAsync(usuario, cancellationToken);
            await _usuarioRepository.GuardarCambiosAsync(cancellationToken);

            // RN-22: Los tokens anteriores quedan invalidados y se entrega uno nuevo
            if (!string.IsNullOrEmpty(currentJti))
            {
                var exp = currentExp ?? DateTime.UtcNow.AddMinutes(30);
                await _tokenRevocadoRepository.RevocarAsync(currentJti, usuario.NombreUsuario, exp, "CAMBIO_CONTRASENA", cancellationToken);
            }

            var nuevoToken = _jwtGenerator.GenerarToken(usuario);

            // RN-21: Auditoría del cambio de contraseña
            var auditoria = new AuditoriaUsuario(
                usuario.NombreUsuario,
                "CAMBIO_PASSWORD_PROPIA",
                usuario.NombreUsuario,
                "Cambio de contraseña exitoso desde perfil (barra superior)",
                ipAddress);
            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _auditoriaRepository.GuardarCambiosAsync(cancellationToken);

            return ApiResponse<string>.Exitoso(nuevoToken, MensajesCatalogo.MSG_47);
        }
        catch
        {
            return ApiResponse<string>.Fallido(MensajesCatalogo.MSG_38);
        }
    }
}
