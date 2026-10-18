using GirasolesRes.Application.DTOs.Cobros;

namespace GirasolesRes.Application.Interfaces.Services;

public interface ICobroService
{
    Task<IReadOnlyList<PedidoPendienteCobroDto>> ObtenerPedidosPendientesCobroAsync(CancellationToken ct = default);
    Task<CobroResponseDto> ProcesarCobroAsync(CobroRequest request, Guid cajeroUsuarioId, string cajeroNombreUsuario, string? direccionIp, CancellationToken ct = default);
    Task<ComprobanteDetalleDto> ObtenerComprobanteAsync(Guid ventaId, bool esCopia = false, CancellationToken ct = default);
    Task<byte[]> GenerarComprobantePdfAsync(Guid ventaId, bool esCopia = false, CancellationToken ct = default);
}
