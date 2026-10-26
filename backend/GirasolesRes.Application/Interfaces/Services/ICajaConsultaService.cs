using GirasolesRes.Application.DTOs.Caja;

namespace GirasolesRes.Application.Interfaces.Services;

/// <summary>
/// Contrato de servicio para consultas de estado de caja, resúmenes, historial y reportes.
/// </summary>
public interface ICajaConsultaService
{
    Task<CajaEstadoResponseDto> ConsultarEstadoActualAsync(Guid? usuarioId = null, CancellationToken ct = default);
    Task<CajaEstadoResponseDto> ObtenerCajaActualAsync(CancellationToken ct = default);
    Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(CancellationToken ct = default);
    Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(Guid usuarioId, CancellationToken ct = default);
    Task<HistorialCierresPaginadoDto> ObtenerHistorialCierresAsync(DateTime? desde, DateTime? hasta, int pagina, int tamano, CancellationToken ct = default);
    Task<CierreDetalleDto> ObtenerDetalleCierreAsync(Guid id, CancellationToken ct = default);
    Task<byte[]> GenerarPdfCierreAsync(Guid id, CancellationToken ct = default);

    // Métodos heredados para retrocompatibilidad
    Task<CajaEstadoDto> ObtenerEstadoCajaAsync(CancellationToken ct = default);
}
