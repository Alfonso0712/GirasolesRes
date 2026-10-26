using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;

namespace GirasolesRes.Application.Services;

/// <summary>
/// Fachada unificada del servicio de caja que compone y delega en los servicios especializados
/// (CajaOperacionService, CajaConsultaService) preservando retrocompatibilidad total.
/// </summary>
public class CajaService : ICajaService
{
    private readonly ICajaOperacionService _operacionService;
    private readonly ICajaConsultaService _consultaService;

    public CajaService(
        ICajaRepository cajaRepository,
        IPedidoRepository pedidoRepository,
        IPdfCierreService pdfCierreService)
        : this(
            new CajaOperacionService(cajaRepository, pedidoRepository),
            new CajaConsultaService(cajaRepository, pedidoRepository, pdfCierreService))
    {
    }

    public CajaService(
        ICajaOperacionService operacionService,
        ICajaConsultaService consultaService)
    {
        _operacionService = operacionService;
        _consultaService = consultaService;
    }

    // Operaciones
    public Task<CajaResponseDto> AbrirCajaAsync(AbrirCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default) =>
        _operacionService.AbrirCajaAsync(dto, usuarioId, nombreUsuario, ct);

    public Task<CierreResponseDto> CerrarCajaAsync(CerrarCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default) =>
        _operacionService.CerrarCajaAsync(dto, usuarioId, nombreUsuario, ct);

    public Task<CajaEstadoDto> AbrirCajaAsync(AbrirCajaRequest request, Guid usuarioId, string nombreUsuario, CancellationToken ct = default) =>
        _operacionService.AbrirCajaAsync(request, usuarioId, nombreUsuario, ct);

    // Consultas
    public Task<CajaEstadoResponseDto> ConsultarEstadoActualAsync(Guid? usuarioId = null, CancellationToken ct = default) =>
        _consultaService.ConsultarEstadoActualAsync(usuarioId, ct);

    public Task<CajaEstadoResponseDto> ObtenerCajaActualAsync(CancellationToken ct = default) =>
        _consultaService.ObtenerCajaActualAsync(ct);

    public Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(CancellationToken ct = default) =>
        _consultaService.ObtenerResumenCierreAsync(ct);

    public Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(Guid usuarioId, CancellationToken ct = default) =>
        _consultaService.ObtenerResumenCierreAsync(usuarioId, ct);

    public Task<HistorialCierresPaginadoDto> ObtenerHistorialCierresAsync(DateTime? desde, DateTime? hasta, int pagina, int tamano, CancellationToken ct = default) =>
        _consultaService.ObtenerHistorialCierresAsync(desde, hasta, pagina, tamano, ct);

    public Task<CierreDetalleDto> ObtenerDetalleCierreAsync(Guid id, CancellationToken ct = default) =>
        _consultaService.ObtenerDetalleCierreAsync(id, ct);

    public Task<byte[]> GenerarPdfCierreAsync(Guid id, CancellationToken ct = default) =>
        _consultaService.GenerarPdfCierreAsync(id, ct);

    public Task<CajaEstadoDto> ObtenerEstadoCajaAsync(CancellationToken ct = default) =>
        _consultaService.ObtenerEstadoCajaAsync(ct);
}
