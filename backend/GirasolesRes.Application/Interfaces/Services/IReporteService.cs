using GirasolesRes.Application.DTOs.Reportes;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IReporteService
{
    Task<ReporteVentasResponseDto> ConsultarReporteVentasAsync(string? desde, string? hasta, CancellationToken ct = default);
    Task<ReportePlatosResponseDto> ConsultarReportePlatosAsync(string? desde, string? hasta, Guid? productoId, CancellationToken ct = default);
    Task<byte[]> ExportarReporteVentasCsvAsync(string? desde, string? hasta, string usuario, string? ip, CancellationToken ct = default);
    Task<byte[]> ExportarReporteVentasPdfAsync(string? desde, string? hasta, string usuario, string? ip, CancellationToken ct = default);
    Task<byte[]> ExportarReportePlatosCsvAsync(string? desde, string? hasta, Guid? productoId, string usuario, string? ip, CancellationToken ct = default);
    Task<byte[]> ExportarReportePlatosPdfAsync(string? desde, string? hasta, Guid? productoId, string usuario, string? ip, CancellationToken ct = default);
}
