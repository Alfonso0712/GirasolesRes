using GirasolesRes.Application.DTOs.Inicio;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IInicioService
{
    Task<InicioResponseDto> ObtenerInicioAsync(string rol, Guid usuarioId, CancellationToken ct = default);
    Task<BloqueResultadoDto> ObtenerBloqueAsync(string bloque, string rol, Guid usuarioId, CancellationToken ct = default);
}
