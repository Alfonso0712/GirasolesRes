using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenuDia;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IMenuDiaService
{
    Task<ApiResponse<MenuDiaResponseDto>> ObtenerMenuHoyAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<List<CandidatoMenuDto>>> ObtenerCandidatosAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<MenuDiaResponseDto>> GuardarMenuHoyAsync(GuardarMenuDiaRequest request, string usuario, string? ipAddress, CancellationToken cancellationToken = default);
    Task<ApiResponse<CambiarDisponibilidadResponseDto>> CambiarDisponibilidadAsync(Guid productoId, bool agotado, string usuario, string? ipAddress, CancellationToken cancellationToken = default);
}
