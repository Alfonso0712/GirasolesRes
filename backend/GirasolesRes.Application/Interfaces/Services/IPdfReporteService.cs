using GirasolesRes.Application.DTOs.Reportes;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IPdfReporteService
{
    byte[] GenerarReporteVentasPdf(ReporteVentasResponseDto reporte);
    byte[] GenerarReportePlatosPdf(ReportePlatosResponseDto reporte, string desde, string hasta);
}
