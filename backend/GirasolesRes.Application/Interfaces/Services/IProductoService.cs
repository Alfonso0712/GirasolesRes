using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Productos;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IProductoService
{
    Task<ApiResponse<PaginacionProductosResponse>> ListarProductosAsync(
        string? busqueda,
        string? categoria,
        string? tipo = null,
        string? rol = null,
        bool? activo = null,
        int pagina = 1,
        int tamano = 10,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<ProductoResponseDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ApiResponse<ProductoResponseDto>> RegistrarProductoAsync(
        CrearProductoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<ProductoResponseDto>> ActualizarProductoAsync(
        Guid id,
        ActualizarProductoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<CambiarEstadoProductoResponseDto>> CambiarEstadoAsync(
        Guid id,
        bool nuevoEstado,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<List<ProductoResponseDto>>> ListarDisponiblesAsync(
        string? categoria,
        string? tipo = null,
        string? rol = null,
        CancellationToken cancellationToken = default);
}
