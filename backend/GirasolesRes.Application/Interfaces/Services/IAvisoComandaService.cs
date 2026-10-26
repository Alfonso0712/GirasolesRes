using GirasolesRes.Application.DTOs.Pedidos;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IAvisoComandaService
{
    Task<IReadOnlyList<AvisoComandaDto>> ObtenerAvisosPendientesAsync(
        Guid usuarioId,
        string rol,
        CancellationToken ct = default);

    Task MarcarAvisoVistoAsync(
        Guid comandaId,
        Guid usuarioId,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default);
}
