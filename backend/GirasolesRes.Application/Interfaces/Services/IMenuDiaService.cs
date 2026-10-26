using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.MenuDia;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IMenuDiaService
{
    Task<Result<MenuDiaResponseDto>> ObtenerMenuHoyAsync(CancellationToken cancellationToken = default);
    Task<Result<List<CandidatoMenuDto>>> ObtenerCandidatosAsync(CancellationToken cancellationToken = default);
    Task<Result<MenuDiaResponseDto>> GuardarMenuHoyAsync(GuardarMenuDiaRequest request, string usuario, string? ipAddress, CancellationToken cancellationToken = default);
    Task<Result<CambiarDisponibilidadResponseDto>> CambiarDisponibilidadAsync(Guid productoId, bool agotado, string usuario, string? ipAddress, CancellationToken cancellationToken = default);
}
