using System.Text;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Reportes;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Services;

public class ReporteService : IReporteService
{
    private readonly IReporteRepository _reporteRepository;
    private readonly IPdfReporteService _pdfReporteService;

    public ReporteService(
        IReporteRepository reporteRepository,
        IPdfReporteService pdfReporteService)
    {
        _reporteRepository = reporteRepository;
        _pdfReporteService = pdfReporteService;
    }

    public async Task<ReporteVentasResponseDto> ConsultarReporteVentasAsync(string? desde, string? hasta, CancellationToken ct = default)
    {
        var (desdeDate, hastaDate) = ValidarYResolverRango(desde, hasta);
        return await _reporteRepository.ObtenerReporteVentasAsync(desdeDate, hastaDate, ct);
    }

    public async Task<ReportePlatosResponseDto> ConsultarReportePlatosAsync(string? desde, string? hasta, Guid? productoId, CancellationToken ct = default)
    {
        var (desdeDate, hastaDate) = ValidarYResolverRango(desde, hasta);
        return await _reporteRepository.ObtenerReportePlatosAsync(desdeDate, hastaDate, productoId, ct);
    }

    public async Task<byte[]> ExportarReporteVentasCsvAsync(string? desde, string? hasta, string usuario, string? ip, CancellationToken ct = default)
    {
        var (desdeDate, hastaDate) = ValidarYResolverRango(desde, hasta);
        var r = await _reporteRepository.ObtenerReporteVentasAsync(desdeDate, hastaDate, ct);

        var ahoraLima = TimeZoneHelper.ObtenerFechaHoraActualLima();
        var sb = new StringBuilder();

        // BOM UTF-8 para compatibilidad universal con Microsoft Excel
        sb.Append('\uFEFF');

        sb.AppendLine("RESTAURANTE GIRASOLES - REPORTE DE VENTAS (CUS14.1)");
        sb.AppendLine($"Rango de consulta:;{r.Desde};al;{r.Hasta}");
        sb.AppendLine($"Fecha y hora de emision:;{ahoraLima:dd/MM/yyyy HH:mm:ss}");
        sb.AppendLine($"Usuario auditor:;{usuario}");
        sb.AppendLine();

        sb.AppendLine("RESUMEN GENERAL DEL PERIODO");
        sb.AppendLine($"Total General (S/);{r.Total:F2}");
        sb.AppendLine($"Total Efectivo (S/);{r.Efectivo:F2}");
        sb.AppendLine($"Total Yape (S/);{r.Yape:F2}");
        sb.AppendLine($"Cantidad de Ventas Vigentes;{r.NVentas}");
        if (r.Anuladas.Cantidad > 0)
        {
            sb.AppendLine($"Ventas Anuladas (no suman);{r.Anuladas.Cantidad};Monto Anulado (S/);{r.Anuladas.Monto:F2}");
        }
        sb.AppendLine();

        sb.AppendLine("DETALLE POR DIA");
        sb.AppendLine("Fecha;Nro Ventas;Efectivo (S/);Yape (S/);Total Dia (S/);Estado");

        foreach (var d in r.PorDia)
        {
            var estado = d.ConAjustes ? "Con ajustes (anulaciones post-cierre)" : "Normal";
            sb.AppendLine($"{d.Fecha};{d.NVentas};{d.Efectivo:F2};{d.Yape:F2};{d.Total:F2};{estado}");
        }

        var auditoria = new AuditoriaReporte(
            audUsuario: usuario,
            audTipoReporte: "Ventas",
            audRango: $"{r.Desde} al {r.Hasta}",
            audFormato: "CSV",
            audDireccionIp: ip
        );
        await _reporteRepository.RegistrarAuditoriaExportacionAsync(auditoria, ct);

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<byte[]> ExportarReporteVentasPdfAsync(string? desde, string? hasta, string usuario, string? ip, CancellationToken ct = default)
    {
        var (desdeDate, hastaDate) = ValidarYResolverRango(desde, hasta);
        var r = await _reporteRepository.ObtenerReporteVentasAsync(desdeDate, hastaDate, ct);

        var pdfBytes = _pdfReporteService.GenerarReporteVentasPdf(r);

        var auditoria = new AuditoriaReporte(
            audUsuario: usuario,
            audTipoReporte: "Ventas",
            audRango: $"{r.Desde} al {r.Hasta}",
            audFormato: "PDF",
            audDireccionIp: ip
        );
        await _reporteRepository.RegistrarAuditoriaExportacionAsync(auditoria, ct);

        return pdfBytes;
    }

    public async Task<byte[]> ExportarReportePlatosCsvAsync(string? desde, string? hasta, Guid? productoId, string usuario, string? ip, CancellationToken ct = default)
    {
        var (desdeDate, hastaDate) = ValidarYResolverRango(desde, hasta);
        var r = await _reporteRepository.ObtenerReportePlatosAsync(desdeDate, hastaDate, productoId, ct);

        var ahoraLima = TimeZoneHelper.ObtenerFechaHoraActualLima();
        var sb = new StringBuilder();

        // BOM UTF-8
        sb.Append('\uFEFF');

        sb.AppendLine("RESTAURANTE GIRASOLES - REPORTE DE PLATOS VENDIDOS (CUS14.2)");
        sb.AppendLine($"Rango de consulta:;{desdeDate:yyyy-MM-dd};al;{hastaDate:yyyy-MM-dd}");
        sb.AppendLine($"Fecha y hora de emision:;{ahoraLima:dd/MM/yyyy HH:mm:ss}");
        sb.AppendLine($"Usuario auditor:;{usuario}");
        sb.AppendLine();

        sb.AppendLine("RESUMEN GENERAL");
        sb.AppendLine($"Total Platos Vendidos;{r.TotalPlatos}");
        sb.AppendLine($"Monto Total Platos (S/);{r.TotalMonto:F2}");
        sb.AppendLine($"Total Ventas en Periodo (S/);{r.TotalVentas:F2}");
        sb.AppendLine($"Estado de Cuadre;{(r.Coincide ? "Cuadra con ventas" : $"Diferencia de S/ {Math.Abs(r.TotalMonto - r.TotalVentas):F2}")}");
        sb.AppendLine();

        sb.AppendLine("SUBTOTALES POR CATEGORIA");
        sb.AppendLine("Categoria;Cantidad Platos;Monto (S/)");
        foreach (var sub in r.Subtotales)
        {
            sb.AppendLine($"{sub.Categoria};{sub.Cantidad};{sub.Monto:F2}");
        }
        sb.AppendLine();

        sb.AppendLine("DETALLE DE PLATOS");
        sb.AppendLine("Producto;Categoria;Estado;Cantidad Vendida;Monto Total (S/)");
        foreach (var item in r.Items)
        {
            var estado = item.Activo ? "Activo" : "Inactivo";
            sb.AppendLine($"{item.Producto};{item.Categoria};{estado};{item.Cantidad};{item.Monto:F2}");
        }

        if (r.PorDia != null && r.PorDia.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("DESGLOSE POR DIA DEL PRODUCTO SELECCIONADO");
            sb.AppendLine("Fecha;Cantidad");
            foreach (var pd in r.PorDia)
            {
                sb.AppendLine($"{pd.Fecha};{pd.Cantidad}");
            }
        }

        var auditoria = new AuditoriaReporte(
            audUsuario: usuario,
            audTipoReporte: "Platos",
            audRango: $"{desdeDate:yyyy-MM-dd} al {hastaDate:yyyy-MM-dd}",
            audFormato: "CSV",
            audDireccionIp: ip
        );
        await _reporteRepository.RegistrarAuditoriaExportacionAsync(auditoria, ct);

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<byte[]> ExportarReportePlatosPdfAsync(string? desde, string? hasta, Guid? productoId, string usuario, string? ip, CancellationToken ct = default)
    {
        var (desdeDate, hastaDate) = ValidarYResolverRango(desde, hasta);
        var r = await _reporteRepository.ObtenerReportePlatosAsync(desdeDate, hastaDate, productoId, ct);

        var pdfBytes = _pdfReporteService.GenerarReportePlatosPdf(r, desdeDate.ToString("yyyy-MM-dd"), hastaDate.ToString("yyyy-MM-dd"));

        var auditoria = new AuditoriaReporte(
            audUsuario: usuario,
            audTipoReporte: "Platos",
            audRango: $"{desdeDate:yyyy-MM-dd} al {hastaDate:yyyy-MM-dd}",
            audFormato: "PDF",
            audDireccionIp: ip
        );
        await _reporteRepository.RegistrarAuditoriaExportacionAsync(auditoria, ct);

        return pdfBytes;
    }

    /// <summary>
    /// Valida el rango de fechas aplicando RV-133 y RV-134 (sin fechas futuras, máx. 366 días, desde <= hasta).
    /// </summary>
    private static (DateOnly Desde, DateOnly Hasta) ValidarYResolverRango(string? desde, string? hasta)
    {
        var hoyPeru = TimeZoneHelper.ObtenerFechaActualLima();
        DateOnly desdeDate;
        DateOnly hastaDate;

        if (string.IsNullOrWhiteSpace(desde) && string.IsNullOrWhiteSpace(hasta))
        {
            desdeDate = hoyPeru;
            hastaDate = hoyPeru;
        }
        else if (!string.IsNullOrWhiteSpace(desde) && string.IsNullOrWhiteSpace(hasta))
        {
            if (!DateOnly.TryParse(desde.Trim(), out desdeDate))
            {
                throw new ArgumentException(MensajesCatalogo.MSG_190);
            }
            hastaDate = hoyPeru;
        }
        else if (string.IsNullOrWhiteSpace(desde) && !string.IsNullOrWhiteSpace(hasta))
        {
            if (!DateOnly.TryParse(hasta.Trim(), out hastaDate))
            {
                throw new ArgumentException(MensajesCatalogo.MSG_190);
            }
            desdeDate = hastaDate;
        }
        else
        {
            if (!DateOnly.TryParse(desde!.Trim(), out desdeDate) || !DateOnly.TryParse(hasta!.Trim(), out hastaDate))
            {
                throw new ArgumentException(MensajesCatalogo.MSG_190);
            }
        }

        // RV-134: "desde" no puede ser posterior a "hasta" -> MSG-190
        if (desdeDate > hastaDate)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_190);
        }

        // RV-134: No hay fechas futuras y el máximo es de 366 días -> MSG-191
        if (desdeDate > hoyPeru || hastaDate > hoyPeru || (hastaDate.DayNumber - desdeDate.DayNumber) > 366)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_191);
        }

        return (desdeDate, hastaDate);
    }
}
