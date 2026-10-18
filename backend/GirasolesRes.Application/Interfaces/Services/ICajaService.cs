using GirasolesRes.Application.DTOs.Caja;

namespace GirasolesRes.Application.Interfaces.Services;

public interface ICajaService
{
    Task<CajaEstadoDto> ObtenerEstadoCajaAsync(CancellationToken ct = default);
    Task<CajaEstadoDto> AbrirCajaAsync(AbrirCajaRequest request, Guid usuarioId, string nombreUsuario, CancellationToken ct = default);
}
