using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Productos;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IProductoService
{
    Task<Result<PaginacionProductosResponse>> ListarProductosAsync(
        string? busqueda,
        string? categoria,
        string? tipo = null,
        string? rol = null,
        bool? activo = null,
        int pagina = 1,
        int tamano = 10,
        CancellationToken cancellationToken = default);

    Task<Result<ProductoResponseDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result<ProductoResponseDto>> RegistrarProductoAsync(
        CrearProductoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<ProductoResponseDto>> ActualizarProductoAsync(
        Guid id,
        ActualizarProductoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<CambiarEstadoProductoResponseDto>> CambiarEstadoAsync(
        Guid id,
        bool nuevoEstado,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<List<ProductoResponseDto>>> ListarDisponiblesAsync(
        string? categoria,
        string? tipo = null,
        string? rol = null,
        CancellationToken cancellationToken = default);
}
