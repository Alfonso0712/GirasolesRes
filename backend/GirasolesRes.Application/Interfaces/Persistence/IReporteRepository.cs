using GirasolesRes.Application.DTOs.Reportes;
using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IReporteRepository
{
    Task<ReporteVentasResponseDto> ObtenerReporteVentasAsync(DateOnly desde, DateOnly hasta, CancellationToken ct = default);
    Task<ReportePlatosResponseDto> ObtenerReportePlatosAsync(DateOnly desde, DateOnly hasta, Guid? productoId, CancellationToken ct = default);
    Task RegistrarAuditoriaExportacionAsync(AuditoriaReporte auditoria, CancellationToken ct = default);
}
