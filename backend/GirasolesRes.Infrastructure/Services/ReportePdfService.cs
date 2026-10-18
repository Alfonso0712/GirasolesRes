using System.Globalization;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Reportes;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Infrastructure.Common;

namespace GirasolesRes.Infrastructure.Services;

public class ReportePdfService : IPdfReporteService
{
    public byte[] GenerarReporteVentasPdf(ReporteVentasResponseDto r)
    {
        var builder = new PdfCanvasBuilder();
        float curY = 28f;

        // 1. Franja corporativa superior (#D35400)
        builder.DrawFilledRect(28f, curY, 539.28f, 4f, 0.827f, 0.329f, 0.000f);
        curY += 10f;

        // Encabezado
        builder.DrawText("RESTAURANTE GIRASOLES", 28f, curY + 14f, "/F2", 15f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("RUC: 20481234567 | Av. Principal 123 - Ayacucho", 28f, curY + 27f, "/F1", 7.5f, 0.40f, 0.40f, 0.40f);

        // Tarjeta derecha
        builder.DrawFilledRect(340f, curY, 227.28f, 38f, 0.980f, 0.969f, 0.957f, 0.282f, 0.157f, 0.075f, 0.8f);
        builder.DrawText("REPORTE OFICIAL DE VENTAS", 348f, curY + 13f, "/F2", 9.5f, 0.282f, 0.157f, 0.075f);
        builder.DrawText($"Rango: {r.Desde} al {r.Hasta}", 348f, curY + 24f, "/F2", 8.5f, 0.827f, 0.329f, 0.000f);
        builder.DrawText("CUS14.1 / Vista 14.1 - Auditoria Gerencial", 348f, curY + 33f, "/F3", 6.5f, 0.45f, 0.45f, 0.45f);

        curY += 46f;
        builder.DrawLine(28f, curY, 567.28f, curY, 0.80f, 0.80f, 0.80f, 0.5f);
        curY += 10f;

        // 2. Tarjetas de Resumen
        float cardW = 128f;
        float cardH = 38f;
        float gap = 9f;

        // Total General
        builder.DrawFilledRect(28f, curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("TOTAL GENERAL", 36f, curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        builder.DrawText($"S/ {r.Total:F2}", 36f, curY + 27f, "/F2", 12f, 0.827f, 0.329f, 0.000f);

        // Efectivo
        builder.DrawFilledRect(28f + (cardW + gap), curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("TOTAL EFECTIVO", 36f + (cardW + gap), curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        builder.DrawText($"S/ {r.Efectivo:F2}", 36f + (cardW + gap), curY + 27f, "/F2", 12f, 0.10f, 0.45f, 0.20f);

        // Yape
        builder.DrawFilledRect(28f + (cardW + gap) * 2, curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("TOTAL YAPE", 36f + (cardW + gap) * 2, curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        builder.DrawText($"S/ {r.Yape:F2}", 36f + (cardW + gap) * 2, curY + 27f, "/F2", 12f, 0.45f, 0.15f, 0.55f);

        // Ventas
        builder.DrawFilledRect(28f + (cardW + gap) * 3, curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("CANTIDAD VENTAS", 36f + (cardW + gap) * 3, curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        builder.DrawText($"{r.NVentas}", 36f + (cardW + gap) * 3, curY + 27f, "/F2", 12f, 0.20f, 0.20f, 0.20f);

        curY += cardH + 12f;

        // 3. Tabla Detalle por Día
        builder.DrawText("DETALLE DE VENTAS POR DIA", 28f, curY + 8f, "/F2", 8.5f, 0.282f, 0.157f, 0.075f);
        curY += 12f;

        // Header de Tabla
        builder.DrawFilledRect(28f, curY, 539.28f, 18f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("FECHA", 36f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("VENTAS", 140f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("EFECTIVO", 240f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("YAPE", 340f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("TOTAL DIA", 440f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("ESTADO", 520f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        curY += 18f;

        if (r.PorDia.Count == 0)
        {
            builder.DrawFilledRect(28f, curY, 539.28f, 22f, 0.98f, 0.98f, 0.98f);
            builder.DrawText("No hay ventas registradas en el rango seleccionado.", 36f, curY + 14f, "/F3", 8f, 0.50f, 0.50f, 0.50f);
            curY += 22f;
        }
        else
        {
            for (int i = 0; i < r.PorDia.Count && curY < 720f; i++)
            {
                var d = r.PorDia[i];
                var bg = i % 2 == 0 ? 1f : 0.965f;
                builder.DrawFilledRect(28f, curY, 539.28f, 16f, bg, bg, bg);

                builder.DrawText(d.Fecha, 36f, curY + 11f, "/F1", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText(d.NVentas.ToString(), 140f, curY + 11f, "/F1", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText($"S/ {d.Efectivo:F2}", 240f, curY + 11f, "/F1", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText($"S/ {d.Yape:F2}", 340f, curY + 11f, "/F1", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText($"S/ {d.Total:F2}", 440f, curY + 11f, "/F2", 7.5f, 0.827f, 0.329f, 0.000f);

                if (d.ConAjustes)
                {
                    builder.DrawText("Con ajustes", 515f, curY + 11f, "/F2", 7f, 0.72f, 0.27f, 0.00f);
                }
                else
                {
                    builder.DrawText("Normal", 515f, curY + 11f, "/F1", 7f, 0.40f, 0.40f, 0.40f);
                }

                curY += 16f;
            }
        }

        // 4. Aviso de Anuladas (MSG-199)
        curY += 12f;
        if (r.Anuladas.Cantidad > 0)
        {
            builder.DrawFilledRect(28f, curY, 539.28f, 22f, 0.99f, 0.94f, 0.94f, 0.90f, 0.65f, 0.65f, 0.5f);
            builder.DrawText($"Nota: Incluye {r.Anuladas.Cantidad} venta(s) anulada(s) por S/ {r.Anuladas.Monto:F2} que no se suman a los totales.", 36f, curY + 14f, "/F3", 7.5f, 0.65f, 0.15f, 0.15f);
            curY += 26f;
        }

        // Pie de Página
        curY = 800f;
        builder.DrawLine(28f, curY, 567.28f, curY, 0.85f, 0.85f, 0.85f, 0.5f);
        curY += 10f;
        var ahoraLima = TimeZoneHelper.ObtenerFechaHoraActualLima();
        builder.DrawText($"Emitido el {ahoraLima:dd/MM/yyyy HH:mm:ss} (Hora oficial de Lima)", 28f, curY, "/F1", 6.5f, 0.50f, 0.50f, 0.50f);
        builder.DrawText("Restaurante Girasoles - Modulo de Reportes (CUS 14)", 230f, curY, "/F3", 6.5f, 0.50f, 0.50f, 0.50f);
        builder.DrawText("Pagina 1 de 1", 520f, curY, "/F2", 6.5f, 0.50f, 0.50f, 0.50f, alignRight: true);

        return builder.BuildPdfBytes("Reporte de Ventas");
    }

    public byte[] GenerarReportePlatosPdf(ReportePlatosResponseDto r, string desde, string hasta)
    {
        var builder = new PdfCanvasBuilder();
        float curY = 28f;

        // 1. Franja corporativa superior (#D35400)
        builder.DrawFilledRect(28f, curY, 539.28f, 4f, 0.827f, 0.329f, 0.000f);
        curY += 10f;

        // Encabezado
        builder.DrawText("RESTAURANTE GIRASOLES", 28f, curY + 14f, "/F2", 15f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("RUC: 20481234567 | Av. Principal 123 - Ayacucho", 28f, curY + 27f, "/F1", 7.5f, 0.40f, 0.40f, 0.40f);

        // Tarjeta derecha
        builder.DrawFilledRect(340f, curY, 227.28f, 38f, 0.980f, 0.969f, 0.957f, 0.282f, 0.157f, 0.075f, 0.8f);
        builder.DrawText("REPORTE DE PLATOS VENDIDOS", 348f, curY + 13f, "/F2", 9.5f, 0.282f, 0.157f, 0.075f);
        builder.DrawText($"Rango: {desde} al {hasta}", 348f, curY + 24f, "/F2", 8.5f, 0.827f, 0.329f, 0.000f);
        builder.DrawText("CUS14.2 / Vistas 14.2 y 14.3", 348f, curY + 33f, "/F3", 6.5f, 0.45f, 0.45f, 0.45f);

        curY += 46f;
        builder.DrawLine(28f, curY, 567.28f, curY, 0.80f, 0.80f, 0.80f, 0.5f);
        curY += 10f;

        // 2. Tarjetas de Resumen
        float cardW = 128f;
        float cardH = 38f;
        float gap = 9f;

        // Total Platos
        builder.DrawFilledRect(28f, curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("TOTAL PLATOS", 36f, curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        builder.DrawText($"{r.TotalPlatos}", 36f, curY + 27f, "/F2", 12f, 0.827f, 0.329f, 0.000f);

        // Monto Platos
        builder.DrawFilledRect(28f + (cardW + gap), curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("MONTO TOTAL PLATOS", 36f + (cardW + gap), curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        builder.DrawText($"S/ {r.TotalMonto:F2}", 36f + (cardW + gap), curY + 27f, "/F2", 12f, 0.10f, 0.45f, 0.20f);

        // Total Ventas
        builder.DrawFilledRect(28f + (cardW + gap) * 2, curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("TOTAL EN VENTAS", 36f + (cardW + gap) * 2, curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        builder.DrawText($"S/ {r.TotalVentas:F2}", 36f + (cardW + gap) * 2, curY + 27f, "/F2", 12f, 0.20f, 0.20f, 0.20f);

        // Cuadre
        builder.DrawFilledRect(28f + (cardW + gap) * 3, curY, cardW, cardH, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawText("ESTADO DE CUADRE", 36f + (cardW + gap) * 3, curY + 12f, "/F2", 7f, 0.40f, 0.40f, 0.40f);
        if (r.Coincide)
        {
            builder.DrawText("CUADRA", 36f + (cardW + gap) * 3, curY + 27f, "/F2", 11f, 0.10f, 0.55f, 0.20f);
        }
        else
        {
            var diff = Math.Abs(r.TotalMonto - r.TotalVentas);
            builder.DrawText($"DIF: S/ {diff:F2}", 36f + (cardW + gap) * 3, curY + 27f, "/F2", 10f, 0.80f, 0.20f, 0.20f);
        }

        curY += cardH + 12f;

        // 3. Subtotales por Categoría
        builder.DrawText("SUBTOTALES POR CATEGORIA:", 28f, curY + 8f, "/F2", 8f, 0.282f, 0.157f, 0.075f);
        curY += 12f;
        float subW = 175f;
        for (int i = 0; i < r.Subtotales.Count && i < 3; i++)
        {
            var s = r.Subtotales[i];
            builder.DrawFilledRect(28f + i * (subW + 7f), curY, subW, 20f, 0.96f, 0.96f, 0.96f);
            builder.DrawText($"{s.Categoria}: {s.Cantidad} platos", 36f + i * (subW + 7f), curY + 13f, "/F2", 7.5f, 0.25f, 0.25f, 0.25f);
            builder.DrawText($"S/ {s.Monto:F2}", 145f + i * (subW + 7f), curY + 13f, "/F2", 7.5f, 0.827f, 0.329f, 0.000f);
        }
        curY += 26f;

        // 4. Tabla de Platos
        builder.DrawText("DETALLE DE PLATOS VENDIDOS", 28f, curY + 8f, "/F2", 8.5f, 0.282f, 0.157f, 0.075f);
        curY += 12f;

        builder.DrawFilledRect(28f, curY, 539.28f, 18f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("PRODUCTO", 36f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("CATEGORIA", 250f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("ESTADO", 350f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("CANTIDAD", 430f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        builder.DrawText("MONTO TOTAL", 500f, curY + 12f, "/F2", 7.5f, 1f, 1f, 1f);
        curY += 18f;

        if (r.Items.Count == 0)
        {
            builder.DrawFilledRect(28f, curY, 539.28f, 22f, 0.98f, 0.98f, 0.98f);
            builder.DrawText("No hay platos vendidos en el periodo seleccionado.", 36f, curY + 14f, "/F3", 8f, 0.50f, 0.50f, 0.50f);
            curY += 22f;
        }
        else
        {
            for (int i = 0; i < r.Items.Count && curY < 720f; i++)
            {
                var item = r.Items[i];
                var bg = i % 2 == 0 ? 1f : 0.965f;
                builder.DrawFilledRect(28f, curY, 539.28f, 16f, bg, bg, bg);

                var prodLabel = item.Activo ? item.Producto : $"{item.Producto} (inactivo)";
                builder.DrawText(prodLabel, 36f, curY + 11f, "/F1", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText(item.Categoria, 250f, curY + 11f, "/F1", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText(item.Activo ? "Activo" : "Inactivo", 350f, curY + 11f, "/F1", 7f, item.Activo ? 0.2f : 0.6f, 0.2f, 0.2f);
                builder.DrawText(item.Cantidad.ToString(), 440f, curY + 11f, "/F2", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText($"S/ {item.Monto:F2}", 510f, curY + 11f, "/F2", 7.5f, 0.827f, 0.329f, 0.000f);

                curY += 16f;
            }
        }

        // Si hay desglose por día
        if (r.PorDia != null && r.PorDia.Count > 0 && curY < 680f)
        {
            curY += 10f;
            builder.DrawText("DESGLOSE POR DIA DEL PRODUCTO SELECCIONADO:", 28f, curY + 8f, "/F2", 8f, 0.282f, 0.157f, 0.075f);
            curY += 12f;

            builder.DrawFilledRect(28f, curY, 260f, 16f, 0.282f, 0.157f, 0.075f);
            builder.DrawText("FECHA", 36f, curY + 11f, "/F2", 7.5f, 1f, 1f, 1f);
            builder.DrawText("CANTIDAD", 190f, curY + 11f, "/F2", 7.5f, 1f, 1f, 1f);
            curY += 16f;

            for (int j = 0; j < r.PorDia.Count && curY < 740f; j++)
            {
                var pd = r.PorDia[j];
                builder.DrawFilledRect(28f, curY, 260f, 15f, j % 2 == 0 ? 1f : 0.965f, 1f, 1f);
                builder.DrawText(pd.Fecha, 36f, curY + 10f, "/F1", 7.5f, 0.20f, 0.20f, 0.20f);
                builder.DrawText(pd.Cantidad.ToString(), 200f, curY + 10f, "/F2", 7.5f, 0.827f, 0.329f, 0.000f);
                curY += 15f;
            }
        }

        // Pie de Página
        curY = 800f;
        builder.DrawLine(28f, curY, 567.28f, curY, 0.85f, 0.85f, 0.85f, 0.5f);
        curY += 10f;
        var ahoraLima = TimeZoneHelper.ObtenerFechaHoraActualLima();
        builder.DrawText($"Emitido el {ahoraLima:dd/MM/yyyy HH:mm:ss} (Hora oficial de Lima)", 28f, curY, "/F1", 6.5f, 0.50f, 0.50f, 0.50f);
        builder.DrawText("Restaurante Girasoles - Modulo de Reportes (CUS 14)", 230f, curY, "/F3", 6.5f, 0.50f, 0.50f, 0.50f);
        builder.DrawText("Pagina 1 de 1", 520f, curY, "/F2", 6.5f, 0.50f, 0.50f, 0.50f, alignRight: true);

        return builder.BuildPdfBytes("Reporte de Platos Vendidos");
    }
}
