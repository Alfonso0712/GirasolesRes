using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Usuarios;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IAuditoriaUsuarioRepository _auditoriaRepository;
    private readonly IPasswordHasherService _passwordHasher;

    public UsuarioService(
        IUsuarioRepository usuarioRepository,
        IAuditoriaUsuarioRepository auditoriaRepository,
        IPasswordHasherService passwordHasher)
    {
        _usuarioRepository = usuarioRepository;
        _auditoriaRepository = auditoriaRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<ApiResponse<PaginacionUsuariosResponse>> ListarUsuariosAsync(
        string? busqueda,
        string? rol,
        bool? activo,
        int pagina = 1,
        int tamano = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            RolUsuario? rolEnum = null;
            if (!string.IsNullOrWhiteSpace(rol) && Enum.TryParse<RolUsuario>(rol, true, out var parsedRol))
            {
                rolEnum = parsedRol;
            }

            // Normalización y límite de búsqueda RV-22
            var busquedaNormalizada = string.IsNullOrWhiteSpace(busqueda)
                ? null
                : (busqueda.Length > 50 ? busqueda.Substring(0, 50) : busqueda).Trim();

            var (items, total) = await _usuarioRepository.ListarUsuariosAsync(
                busquedaNormalizada,
                rolEnum,
                activo,
                pagina,
                tamano,
                cancellationToken);

            var dtos = items.Select(MapearADto).ToList();

            var response = new PaginacionUsuariosResponse
            {
                Items = dtos,
                Total = total
            };

            return ApiResponse<PaginacionUsuariosResponse>.Exitoso(response);
        }
        catch
        {
            return ApiResponse<PaginacionUsuariosResponse>.Fallido(MensajesCatalogo.MSG_37);
        }
    }

    public async Task<ApiResponse<UsuarioResponseDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (usuario == null)
            {
                return ApiResponse<UsuarioResponseDto>.Fallido("Usuario no encontrado.");
            }

            return ApiResponse<UsuarioResponseDto>.Exitoso(MapearADto(usuario));
        }
        catch
        {
            return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_38);
        }
    }

    public async Task<ApiResponse<UsuarioResponseDto>> RegistrarUsuarioAsync(
        CrearUsuarioRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // RV-17: Recorte de espacios
            request.Nombre = request.Nombre.Trim();
            request.Usuario = request.Usuario.Trim().ToLowerInvariant();
            request.Correo = string.IsNullOrWhiteSpace(request.Correo) ? null : request.Correo.Trim().ToLowerInvariant();

            // RV-12 / RN-08: Unicidad de usuario
            if (await _usuarioRepository.ExisteNombreUsuarioAsync(request.Usuario, null, cancellationToken))
            {
                return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_21);
            }

            // RV-16 / RN-08: Unicidad de correo si se proporciona
            if (!string.IsNullOrWhiteSpace(request.Correo) &&
                await _usuarioRepository.ExisteCorreoAsync(request.Correo, null, cancellationToken))
            {
                return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_24);
            }

            if (!Enum.TryParse<RolUsuario>(request.Rol, true, out var rolEnum))
            {
                return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_22);
            }

            // RNF-01: Hash de contraseña PBKDF2
            var passwordHash = _passwordHasher.HashPassword(request.Contrasena);

            // RN-09: Estado inicial Activo
            var usuario = new Usuario(
                usuUsuario: request.Usuario,
                usuNombre: request.Nombre,
                usuCorreo: request.Correo,
                usuPasswordHash: passwordHash,
                usuRol: rolEnum,
                usuActivo: true);

            await _usuarioRepository.AgregarAsync(usuario, cancellationToken);

            // RN-14: Registro en auditoría atómica
            var auditoria = new AuditoriaUsuario(
                adminUsername,
                "REGISTRO",
                usuario.Usu_Usuario,
                $"Rol asignado: {usuario.Usu_Rol}",
                ipAddress);
            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _usuarioRepository.GuardarCambiosAsync(cancellationToken);

            return ApiResponse<UsuarioResponseDto>.Exitoso(MapearADto(usuario), MensajesCatalogo.MSG_25);
        }
        catch
        {
            return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_38);
        }
    }

    public async Task<ApiResponse<UsuarioResponseDto>> ActualizarUsuarioAsync(
        Guid id,
        ActualizarUsuarioRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (usuario == null)
            {
                return ApiResponse<UsuarioResponseDto>.Fallido("Usuario no encontrado.");
            }

            // RV-17: Recorte de espacios
            request.Nombre = request.Nombre.Trim();
            request.Usuario = request.Usuario.Trim().ToLowerInvariant();
            request.Correo = string.IsNullOrWhiteSpace(request.Correo) ? null : request.Correo.Trim().ToLowerInvariant();

            // RV-12 / RN-08: Unicidad de nombre de usuario
            if (await _usuarioRepository.ExisteNombreUsuarioAsync(request.Usuario, id, cancellationToken))
            {
                return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_21);
            }

            // RV-16 / RN-08: Unicidad de correo
            if (!string.IsNullOrWhiteSpace(request.Correo) &&
                await _usuarioRepository.ExisteCorreoAsync(request.Correo, id, cancellationToken))
            {
                return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_24);
            }

            if (!Enum.TryParse<RolUsuario>(request.Rol, true, out var nuevoRol))
            {
                return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_22);
            }

            // RN-10: Protección del último administrador activo ante cambio de rol
            if (usuario.Usu_Rol == RolUsuario.Administrador && nuevoRol != RolUsuario.Administrador && usuario.Usu_Activo)
            {
                var adminActivos = await _usuarioRepository.ContarAdministradoresActivosAsync(cancellationToken);
                if (adminActivos <= 1)
                {
                    return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_32);
                }
            }

            // Actualizar datos del usuario
            usuario.ActualizarDatos(request.Nombre, request.Usuario, request.Correo, nuevoRol);

            var cambioPassword = false;
            if (!string.IsNullOrWhiteSpace(request.Contrasena))
            {
                var nuevoHash = _passwordHasher.HashPassword(request.Contrasena);
                usuario.ActualizarPassword(nuevoHash);
                cambioPassword = true;
            }

            await _usuarioRepository.ActualizarAsync(usuario, cancellationToken);

            // RN-14: Registro en auditoría atómica
            var accionAuditoria = cambioPassword ? "EDICION_Y_PASSWORD" : "EDICION";
            var auditoria = new AuditoriaUsuario(
                adminUsername,
                accionAuditoria,
                usuario.Usu_Usuario,
                $"Rol: {usuario.Usu_Rol}",
                ipAddress);
            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _usuarioRepository.GuardarCambiosAsync(cancellationToken);

            return ApiResponse<UsuarioResponseDto>.Exitoso(MapearADto(usuario), MensajesCatalogo.MSG_26);
        }
        catch
        {
            return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_38);
        }
    }

    public async Task<ApiResponse<UsuarioResponseDto>> CambiarEstadoAsync(
        Guid id,
        bool nuevoEstado,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (usuario == null)
            {
                return ApiResponse<UsuarioResponseDto>.Fallido("Usuario no encontrado.");
            }

            if (!nuevoEstado)
            {
                // RV-21 / RN-10: Intento de desactivar su propia cuenta
                if (usuario.Usu_Usuario.Equals(adminUsername.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_31);
                }

                // RV-21 / RN-10: Intento de desactivar el último administrador activo
                if (usuario.Usu_Rol == RolUsuario.Administrador)
                {
                    var adminActivos = await _usuarioRepository.ContarAdministradoresActivosAsync(cancellationToken);
                    if (adminActivos <= 1)
                    {
                        return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_32);
                    }
                }
            }

            usuario.CambiarEstado(nuevoEstado);
            await _usuarioRepository.ActualizarAsync(usuario, cancellationToken);

            // RN-14: Registro en auditoría atómica
            var accion = nuevoEstado ? "ACTIVACION" : "DESACTIVACION";
            var auditoria = new AuditoriaUsuario(
                adminUsername,
                accion,
                usuario.Usu_Usuario,
                $"Estado cambiado a {(nuevoEstado ? "Activo" : "Inactivo")}",
                ipAddress);
            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _usuarioRepository.GuardarCambiosAsync(cancellationToken);

            var mensajeExito = nuevoEstado ? MensajesCatalogo.MSG_30 : MensajesCatalogo.MSG_29;
            return ApiResponse<UsuarioResponseDto>.Exitoso(MapearADto(usuario), mensajeExito);
        }
        catch
        {
            return ApiResponse<UsuarioResponseDto>.Fallido(MensajesCatalogo.MSG_38);
        }
    }

    public async Task<ApiResponse<bool>> EliminarUsuarioAsync(
        Guid id,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id, cancellationToken);
            if (usuario == null)
            {
                return ApiResponse<bool>.Fallido("Usuario no encontrado.");
            }

            // RV-21 / RN-10: No puede eliminar su propia cuenta
            if (usuario.Usu_Usuario.Equals(adminUsername.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return ApiResponse<bool>.Fallido(MensajesCatalogo.MSG_31);
            }

            // RV-21 / RN-10: No puede eliminar el último administrador activo
            if (usuario.Usu_Rol == RolUsuario.Administrador && usuario.Usu_Activo)
            {
                var adminActivos = await _usuarioRepository.ContarAdministradoresActivosAsync(cancellationToken);
                if (adminActivos <= 1)
                {
                    return ApiResponse<bool>.Fallido(MensajesCatalogo.MSG_32);
                }
            }

            // RN-11: No se puede eliminar si tiene movimientos
            var tieneMovimientos = await _usuarioRepository.TieneMovimientosAsync(id, cancellationToken);
            if (tieneMovimientos)
            {
                return ApiResponse<bool>.Fallido(MensajesCatalogo.MSG_34);
            }

            var nombreAfectado = usuario.Usu_Usuario;
            await _usuarioRepository.EliminarAsync(usuario, cancellationToken);

            // RN-14: Registro en auditoría atómica (guarda nombre como texto)
            var auditoria = new AuditoriaUsuario(
                adminUsername,
                "ELIMINACION",
                nombreAfectado,
                "Eliminación física del usuario sin movimientos",
                ipAddress);
            await _auditoriaRepository.RegistrarAsync(auditoria, cancellationToken);
            await _usuarioRepository.GuardarCambiosAsync(cancellationToken);

            return ApiResponse<bool>.Exitoso(true, MensajesCatalogo.MSG_35);
        }
        catch
        {
            return ApiResponse<bool>.Fallido(MensajesCatalogo.MSG_38);
        }
    }

    private static UsuarioResponseDto MapearADto(Usuario u)
    {
        return new UsuarioResponseDto
        {
            Id = u.Id_Usuario,
            Nombre = u.Usu_Nombre,
            Usuario = u.Usu_Usuario,
            Correo = u.Usu_Correo,
            Rol = u.Usu_Rol.ToString(),
            Activo = u.Usu_Activo,
            FechaCreacion = u.Usu_FechaCreacionUtc
        };
    }
}
