using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Usuarios;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IUsuarioService
{
    Task<ApiResponse<PaginacionUsuariosResponse>> ListarUsuariosAsync(
        string? busqueda,
        string? rol,
        bool? activo,
        int pagina = 1,
        int tamano = 10,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<UsuarioResponseDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ApiResponse<UsuarioResponseDto>> RegistrarUsuarioAsync(
        CrearUsuarioRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<UsuarioResponseDto>> ActualizarUsuarioAsync(
        Guid id,
        ActualizarUsuarioRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<UsuarioResponseDto>> CambiarEstadoAsync(
        Guid id,
        bool nuevoEstado,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<bool>> EliminarUsuarioAsync(
        Guid id,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);
}
