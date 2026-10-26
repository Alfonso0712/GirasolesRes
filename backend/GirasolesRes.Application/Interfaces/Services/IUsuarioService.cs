using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Usuarios;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IUsuarioService
{
    Task<Result<PaginacionUsuariosResponse>> ListarUsuariosAsync(
        string? busqueda,
        string? rol,
        bool? activo,
        int pagina = 1,
        int tamano = 10,
        CancellationToken cancellationToken = default);

    Task<Result<UsuarioResponseDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result<UsuarioResponseDto>> RegistrarUsuarioAsync(
        CrearUsuarioRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<UsuarioResponseDto>> ActualizarUsuarioAsync(
        Guid id,
        ActualizarUsuarioRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<UsuarioResponseDto>> CambiarEstadoAsync(
        Guid id,
        bool nuevoEstado,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> EliminarUsuarioAsync(
        Guid id,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);
}
