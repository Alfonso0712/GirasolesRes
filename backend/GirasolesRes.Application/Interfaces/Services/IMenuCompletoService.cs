using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenusCompletos;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IMenuCompletoService
{
    Task<ApiResponse<List<MenuCompletoResponseDto>>> ObtenerTodosAsync(bool soloActivos = false, CancellationToken cancellationToken = default);
    Task<ApiResponse<MenuCompletoResponseDto>> ObtenerPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResponse<MenuCompletoResponseDto>> ActualizarPrecioAsync(
        int id,
        ActualizarPrecioMenuCompletoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);
    Task<ApiResponse<MenuCompletoResponseDto>> CambiarEstadoAsync(
        int id,
        CambiarEstadoMenuCompletoRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);
}
