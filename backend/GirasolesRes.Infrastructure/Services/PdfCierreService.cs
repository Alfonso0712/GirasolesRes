using System.Globalization;
using System.Text;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Infrastructure.Services;

public class PdfCierreService : IPdfCierreService
{
    private readonly ICajaRepository _cajaRepository;

    public PdfCierreService(ICajaRepository cajaRepository)
    {
        _cajaRepository = cajaRepository;
    }

    public async Task<byte[]> GenerarVoucherCierreAsync(Guid cajaId, CancellationToken ct = default)
    {
        var caja = await _cajaRepository.ObtenerPorIdConDetallesAsync(cajaId, ct);
        if (caja == null)
        {
            throw new KeyNotFoundException($"No se encontró el registro de caja con ID {cajaId}.");
        }

        if (caja.Caj_Estado != EstadoCaja.Cerrada)
        {
            throw new InvalidOperationException("Solo se puede generar el comprobante de una caja debidamente cerrada.");
        }

        var fechaAperturaLima = TimeZoneHelper.ToPeruTime(caja.Caj_FechaAperturaUtc);
        var fechaCierreLima = caja.Caj_FechaCierreUtc.HasValue
            ? TimeZoneHelper.ToPeruTime(caja.Caj_FechaCierreUtc.Value)
            : fechaAperturaLima;

        var cajeroApertura = caja.Caj_Usuario?.Usu_Nombre ?? "Cajero(a)";
        var cajeroCierre = caja.Caj_UsuarioCierre?.Usu_Nombre ?? cajeroApertura;

        var platosVendidos = caja.Caj_Ventas
            .Where(v => v.Ven_Estado == EstadoVenta.Vigente && v.Ven_Pedido != null)
            .SelectMany(v => v.Ven_Pedido!.Ped_Detalles)
            .GroupBy(d => d.Det_Producto != null ? d.Det_Producto.Pro_Nombre : "Producto General")
            .Select(g =>
            {
                var cant = g.Sum(d => d.Det_Cantidad);
                var subtotal = decimal.Round(g.Sum(d => d.Det_Subtotal), 2);
                return new PlatoVendidoVoucherDto
                {
                    Nombre = g.Key,
                    Cantidad = cant,
                    PrecioUnitarioPromedio = cant > 0 ? decimal.Round(subtotal / cant, 2) : 0m,
                    Subtotal = subtotal
                };
            })
            .OrderByDescending(p => p.Subtotal)
            .ToList();

        var datos = new CierreVoucherDto
        {
            CajaId = caja.Id_Caja,
            NumeroCierre = $"C-{fechaCierreLima:yyyyMMdd}-{caja.Id_Caja.ToString("N")[..6].ToUpper()}",
            FechaAperturaLocal = fechaAperturaLima,
            FechaCierreLocal = fechaCierreLima,
            CajeroApertura = cajeroApertura,
            CajeroCierre = cajeroCierre,
            SolicitudIdCierre = caja.Caj_SolicitudIdCierre,
            MontoInicial = caja.Caj_MontoApertura,
            VentasEfectivo = caja.Caj_TotalVentasEfectivo ?? 0m,
            VentasYape = caja.Caj_TotalVentasYape ?? 0m,
            TotalVentas = caja.Caj_TotalVentas ?? 0m,
            CantidadVentas = caja.Caj_CantidadVentas ?? 0,
            EfectivoEsperado = caja.Caj_MontoEsperado ?? (caja.Caj_MontoApertura + (caja.Caj_TotalVentasEfectivo ?? 0m)),
            EfectivoContado = caja.Caj_MontoCierre ?? 0m,
            Diferencia = caja.Caj_Diferencia ?? 0m,
            EstadoCuadre = caja.ObtenerEstadoCuadre()?.ToString() ?? (caja.Caj_Diferencia == 0m ? "Cuadra" : (caja.Caj_Diferencia > 0m ? "Sobrante" : "Faltante")),
            Observacion = caja.Caj_Observacion,
            PlatosVendidos = platosVendidos
        };

        return GenerarVoucherCierre(datos);
    }

    public byte[] GenerarVoucherCierre(CierreVoucherDto d)
    {
        var builder = new PdfCanvasBuilder();

        // Dimensiones A4: 595.28 x 841.89 pt
        // Margen superior = 28 pt, margen izquierdo = 28 pt
        float curY = 28f;

        // --- 1. ENCABEZADO Y FRANJA CORPORATIVA ---
        // Banda de acento superior (#D35400)
        builder.DrawFilledRect(28f, curY, 539.28f, 4f, 0.827f, 0.329f, 0.000f);
        curY += 10f;

        // Título del Restaurante y Datos Fiscales
        builder.DrawText("RESTAURANTE GIRASOLES", 28f, curY + 14f, "/F2", 16f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("RUC: 20481234567 | Av. Principal 123 - Ayacucho | Tel: (066) 31-2345", 28f, curY + 28f, "/F1", 7.5f, 0.40f, 0.40f, 0.40f);

        // Tarjeta de Título de Comprobante (Lado derecho)
        builder.DrawFilledRect(340f, curY, 227.28f, 38f, 0.980f, 0.969f, 0.957f, 0.282f, 0.157f, 0.075f, 0.8f);
        builder.DrawText("COMPROBANTE DE CIERRE DE CAJA", 348f, curY + 14f, "/F2", 9.5f, 0.282f, 0.157f, 0.075f);
        builder.DrawText($"N.o Cierre: {d.NumeroCierre}", 348f, curY + 26f, "/F2", 9f, 0.827f, 0.329f, 0.000f);
        builder.DrawText("Documento Oficial de Arqueo (RNF-48)", 348f, curY + 34f, "/F3", 6.5f, 0.45f, 0.45f, 0.45f);

        curY += 46f;
        builder.DrawLine(28f, curY, 567.28f, curY, 0.80f, 0.80f, 0.80f, 0.5f);
        curY += 8f;

        // --- 2. DATOS GENERALES DEL TURNO (Metadatos) ---
        builder.DrawFilledRect(28f, curY, 539.28f, 36f, 0.97f, 0.97f, 0.97f, 0.85f, 0.85f, 0.85f, 0.5f);
        var duracion = d.FechaCierreLocal - d.FechaAperturaLocal;
        var duracionStr = $"{(int)duracion.TotalHours}h {duracion.Minutes:D2}m";

        builder.DrawText($"Fecha/Hora Apertura: {d.FechaAperturaLocal:dd/MM/yyyy HH:mm}", 36f, curY + 12f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText($"Fecha/Hora Cierre   : {d.FechaCierreLocal:dd/MM/yyyy HH:mm}", 36f, curY + 23f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText($"Duracion del Turno  : {duracionStr}", 36f, curY + 32f, "/F3", 7.5f, 0.40f, 0.40f, 0.40f);

        builder.DrawText($"Cajero Apertura : {d.CajeroApertura}", 310f, curY + 12f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText($"Cajero Cierre   : {d.CajeroCierre}", 310f, curY + 23f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText("Estado Operativo: CERRADA (Inmutable)", 310f, curY + 32f, "/F2", 7.5f, 0.18f, 0.49f, 0.20f);

        curY += 44f;

        // --- 3. RESUMEN FINANCIERO Y ARQUEO DE CAJA (Dos Tarjetas Paralelas) ---
        float colWidth = 262f;
        float cardHeight = 110f;
        float cardY = curY;

        // Tarjeta Izquierda: Resumen Financiero
        builder.DrawFilledRect(28f, cardY, colWidth, cardHeight, 1.0f, 1.0f, 1.0f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawFilledRect(28f, cardY, colWidth, 18f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("RESUMEN FINANCIERO DE VENTAS", 36f, cardY + 12f, "/F2", 8f, 1.0f, 1.0f, 1.0f);

        builder.DrawText("Fondo Inicial (Apertura):", 36f, cardY + 32f, "/F1", 8f, 0.30f, 0.30f, 0.30f);
        builder.DrawText($"S/ {d.MontoInicial,9:F2}", 225f, cardY + 32f, "/F2", 8f, 0.20f, 0.20f, 0.20f, alignRight: true);

        builder.DrawText("Ventas en Efectivo:", 36f, cardY + 46f, "/F1", 8f, 0.30f, 0.30f, 0.30f);
        builder.DrawText($"S/ {d.VentasEfectivo,9:F2}", 225f, cardY + 46f, "/F2", 8f, 0.20f, 0.20f, 0.20f, alignRight: true);

        builder.DrawText("Ventas por Yape (Digital):", 36f, cardY + 60f, "/F1", 8f, 0.30f, 0.30f, 0.30f);
        builder.DrawText($"S/ {d.VentasYape,9:F2}", 225f, cardY + 60f, "/F2", 8f, 0.20f, 0.20f, 0.20f, alignRight: true);

        builder.DrawLine(36f, cardY + 68f, 280f, cardY + 68f, 0.85f, 0.85f, 0.85f, 0.5f);

        builder.DrawText("TOTAL VENTAS FACTURADAS:", 36f, cardY + 82f, "/F2", 8.5f, 0.282f, 0.157f, 0.075f);
        builder.DrawText($"S/ {d.TotalVentas,9:F2}", 225f, cardY + 82f, "/F2", 9.5f, 0.827f, 0.329f, 0.000f, alignRight: true);

        builder.DrawText($"Total de Transacciones: {d.CantidadVentas} ventas emitidas", 36f, cardY + 98f, "/F3", 7.5f, 0.45f, 0.45f, 0.45f);

        // Tarjeta Derecha: Arqueo y Cuadre
        float col2X = 305.28f;
        builder.DrawFilledRect(col2X, cardY, colWidth, cardHeight, 1.0f, 1.0f, 1.0f, 0.85f, 0.85f, 0.85f, 0.5f);
        builder.DrawFilledRect(col2X, cardY, colWidth, 18f, 0.827f, 0.329f, 0.000f);
        builder.DrawText("ARQUEO Y CUADRE DE EFECTIVO", col2X + 8f, cardY + 12f, "/F2", 8f, 1.0f, 1.0f, 1.0f);

        builder.DrawText("Efectivo Fisico Esperado:", col2X + 8f, cardY + 32f, "/F1", 8f, 0.30f, 0.30f, 0.30f);
        builder.DrawText($"S/ {d.EfectivoEsperado,9:F2}", col2X + 200f, cardY + 32f, "/F2", 8f, 0.20f, 0.20f, 0.20f, alignRight: true);

        builder.DrawText("Efectivo Fisico Contado:", col2X + 8f, cardY + 46f, "/F1", 8f, 0.30f, 0.30f, 0.30f);
        builder.DrawText($"S/ {d.EfectivoContado,9:F2}", col2X + 200f, cardY + 46f, "/F2", 8f, 0.20f, 0.20f, 0.20f, alignRight: true);

        builder.DrawLine(col2X + 8f, cardY + 54f, col2X + 252f, cardY + 54f, 0.85f, 0.85f, 0.85f, 0.5f);

        builder.DrawText("Diferencia de Cuadre:", col2X + 8f, cardY + 68f, "/F2", 8.5f, 0.20f, 0.20f, 0.20f);
        var diffPrefix = d.Diferencia > 0 ? "+" : "";
        builder.DrawText($"S/ {diffPrefix}{d.Diferencia,8:F2}", col2X + 200f, cardY + 68f, "/F2", 9f, 0.20f, 0.20f, 0.20f, alignRight: true);

        // Badge de Estado de Cuadre
        if (d.Diferencia == 0m)
        {
            builder.DrawFilledRect(col2X + 8f, cardY + 78f, 244f, 22f, 0.180f, 0.490f, 0.196f);
            builder.DrawText("ESTADO: CUADRA (S/ 0.00)", col2X + 60f, cardY + 92f, "/F2", 9f, 1.0f, 1.0f, 1.0f);
        }
        else if (d.Diferencia > 0m)
        {
            builder.DrawFilledRect(col2X + 8f, cardY + 78f, 244f, 22f, 0.718f, 0.584f, 0.043f);
            builder.DrawText($"ESTADO: SOBRANTE (+S/ {d.Diferencia:F2})", col2X + 45f, cardY + 92f, "/F2", 9f, 1.0f, 1.0f, 1.0f);
        }
        else
        {
            builder.DrawFilledRect(col2X + 8f, cardY + 78f, 244f, 22f, 0.753f, 0.224f, 0.169f);
            builder.DrawText($"ESTADO: FALTANTE (-S/ {Math.Abs(d.Diferencia):F2})", col2X + 45f, cardY + 92f, "/F2", 9f, 1.0f, 1.0f, 1.0f);
        }

        curY += cardHeight + 10f;

        // --- 4. CONSOLIDADO DE PLATOS Y PRODUCTOS VENDIDOS ---
        builder.DrawText("CONSOLIDADO DE PRODUCTOS Y PLATOS VENDIDOS DURANTE EL TURNO", 28f, curY + 9f, "/F2", 8.5f, 0.282f, 0.157f, 0.075f);
        curY += 13f;

        // Encabezado de la Tabla
        builder.DrawFilledRect(28f, curY, 539.28f, 16f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("#", 34f, curY + 11f, "/F2", 7.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Cant.", 55f, curY + 11f, "/F2", 7.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Nombre del Plato / Bebida", 100f, curY + 11f, "/F2", 7.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("P. Unit Prom.", 410f, curY + 11f, "/F2", 7.5f, 1.0f, 1.0f, 1.0f, alignRight: true);
        builder.DrawText("Subtotal (S/)", 525f, curY + 11f, "/F2", 7.5f, 1.0f, 1.0f, 1.0f, alignRight: true);
        curY += 16f;

        // Filas de Datos con Regla Anti-Desborde (Top 11 + Otros si > 12)
        int maxRows = 12;
        var itemsToDisplay = d.PlatosVendidos;
        bool hasAggregation = itemsToDisplay.Count > maxRows;
        int directCount = hasAggregation ? 11 : itemsToDisplay.Count;

        float rowHeight = 14f;
        int rowIdx = 1;
        int totalUnidades = 0;
        decimal totalPlatos = 0m;

        if (itemsToDisplay.Count == 0)
        {
            builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.98f, 0.98f, 0.98f);
            builder.DrawText("Sin ventas de platos registradas en este turno", 100f, curY + 10f, "/F3", 7.5f, 0.5f, 0.5f, 0.5f);
            curY += rowHeight;
        }
        else
        {
            for (int i = 0; i < directCount; i++)
            {
                var p = itemsToDisplay[i];
                totalUnidades += p.Cantidad;
                totalPlatos += p.Subtotal;

                bool isEven = (rowIdx % 2 == 0);
                if (isEven)
                {
                    builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.965f, 0.965f, 0.965f);
                }

                builder.DrawText(rowIdx.ToString(), 34f, curY + 10f, "/F1", 7.5f, 0.3f, 0.3f, 0.3f);
                builder.DrawText(p.Cantidad.ToString(), 58f, curY + 10f, "/F2", 7.5f, 0.2f, 0.2f, 0.2f);

                var nombreTruncado = p.Nombre.Length > 48 ? p.Nombre[..48] + "..." : p.Nombre;
                builder.DrawText(nombreTruncado, 100f, curY + 10f, "/F1", 7.5f, 0.15f, 0.15f, 0.15f);

                builder.DrawText($"S/ {p.PrecioUnitarioPromedio,6:F2}", 410f, curY + 10f, "/F1", 7.5f, 0.3f, 0.3f, 0.3f, alignRight: true);
                builder.DrawText($"S/ {p.Subtotal,7:F2}", 525f, curY + 10f, "/F2", 7.5f, 0.15f, 0.15f, 0.15f, alignRight: true);

                curY += rowHeight;
                rowIdx++;
            }

            if (hasAggregation)
            {
                var remaining = itemsToDisplay.Skip(directCount).ToList();
                int sumCantRest = remaining.Sum(r => r.Cantidad);
                decimal sumSubRest = remaining.Sum(r => r.Subtotal);
                totalUnidades += sumCantRest;
                totalPlatos += sumSubRest;

                builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.94f, 0.94f, 0.94f);
                builder.DrawText("-", 34f, curY + 10f, "/F1", 7.5f, 0.4f, 0.4f, 0.4f);
                builder.DrawText(sumCantRest.ToString(), 58f, curY + 10f, "/F2", 7.5f, 0.2f, 0.2f, 0.2f);
                builder.DrawText($"Otros productos del turno ({remaining.Count} variedades adicionales)", 100f, curY + 10f, "/F3", 7.5f, 0.3f, 0.3f, 0.3f);
                builder.DrawText("-", 410f, curY + 10f, "/F1", 7.5f, 0.4f, 0.4f, 0.4f, alignRight: true);
                builder.DrawText($"S/ {sumSubRest,7:F2}", 525f, curY + 10f, "/F2", 7.5f, 0.15f, 0.15f, 0.15f, alignRight: true);
                curY += rowHeight;
            }
        }

        // Fila Totalizadora de la Tabla
        builder.DrawFilledRect(28f, curY, 539.28f, 15f, 0.90f, 0.90f, 0.90f, 0.70f, 0.70f, 0.70f, 0.5f);
        builder.DrawText($"TOTAL CONSOLIDADO: {totalUnidades} unidades vendidas", 55f, curY + 11f, "/F2", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText($"S/ {totalPlatos,8:F2}", 525f, curY + 11f, "/F2", 8.5f, 0.827f, 0.329f, 0.000f, alignRight: true);
        curY += 21f;

        // --- 5. OBSERVACIONES DEL ARQUEO ---
        builder.DrawText("OBSERVACIONES DEL ARQUEO:", 28f, curY + 7f, "/F2", 7.5f, 0.282f, 0.157f, 0.075f);
        curY += 10f;
        builder.DrawFilledRect(28f, curY, 539.28f, 26f, 0.985f, 0.985f, 0.985f, 0.85f, 0.85f, 0.85f, 0.5f);

        var obsText = string.IsNullOrWhiteSpace(d.Observacion)
            ? "Sin observaciones registradas al momento del cierre de caja."
            : d.Observacion.Trim();
        var obsFont = string.IsNullOrWhiteSpace(d.Observacion) ? "/F3" : "/F1";
        builder.DrawText(obsText, 36f, curY + 16f, obsFont, 7.5f, 0.30f, 0.30f, 0.30f);

        curY += 34f;

        // --- 6. BLOQUE DE FIRMAS Y CONFORMIDAD (Dos Columnas) ---
        float firmaWidth = 230f;
        float firmaY = curY + 36f;

        // Firma Cajero(a)
        builder.DrawLine(50f, firmaY, 50f + firmaWidth, firmaY, 0.30f, 0.30f, 0.30f, 0.8f);
        builder.DrawText("FIRMA DEL CAJERO(A) RESPONSABLE", 75f, firmaY + 11f, "/F2", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText($"Nombre: {d.CajeroCierre}", 85f, firmaY + 20f, "/F1", 7.5f, 0.35f, 0.35f, 0.35f);
        builder.DrawText("DNI: _______________________", 85f, firmaY + 29f, "/F1", 7f, 0.45f, 0.45f, 0.45f);

        // Firma Administrador(a)
        float firma2X = 315f;
        builder.DrawLine(firma2X, firmaY, firma2X + firmaWidth, firmaY, 0.30f, 0.30f, 0.30f, 0.8f);
        builder.DrawText("FIRMA ADMINISTRACION / GERENCIA", firma2X + 22f, firmaY + 11f, "/F2", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText("V.o B.o Arqueo de Caja y Conformidad", firma2X + 32f, firmaY + 20f, "/F1", 7.5f, 0.35f, 0.35f, 0.35f);
        builder.DrawText("Sello / Fecha: ___________________", firma2X + 32f, firmaY + 29f, "/F1", 7f, 0.45f, 0.45f, 0.45f);

        curY = firmaY + 38f;

        // --- 7. PIE DE PAGINA Y AUDITORIA ---
        builder.DrawLine(28f, curY, 567.28f, curY, 0.85f, 0.85f, 0.85f, 0.5f);
        curY += 9f;

        var ahoraLima = TimeZoneHelper.ObtenerFechaHoraActualLima();
        builder.DrawText($"Generado el {ahoraLima:dd/MM/yyyy HH:mm:ss} (Hora oficial de Lima)", 28f, curY, "/F1", 6.5f, 0.50f, 0.50f, 0.50f);
        builder.DrawText("Restaurante Girasoles - Modulo de Gestion de Caja (CUS 13)", 240f, curY, "/F3", 6.5f, 0.50f, 0.50f, 0.50f);
        builder.DrawText("Pagina 1 de 1 (RNF-48)", 520f, curY, "/F2", 6.5f, 0.50f, 0.50f, 0.50f, alignRight: true);

        return builder.BuildPdfBytes();
    }
}

/// <summary>
/// Constructor de bajo nivel de archivos PDF 1.4 vectoriales sin dependencias externas.
/// </summary>
internal class PdfCanvasBuilder
{
    private const float PageWidth = 595.28f;
    private const float PageHeight = 841.89f;

    private readonly StringBuilder _stream = new(8192);

    private float ToPdfY(float topDownY) => PageHeight - topDownY;

    public void DrawFilledRect(float x, float topY, float width, float height,
        float rFill, float gFill, float bFill,
        float? rStroke = null, float? gStroke = null, float? bStroke = null, float strokeWidth = 1f)
    {
        var pdfY = ToPdfY(topY + height);
        _stream.Append(CultureInfo.InvariantCulture, $"q\n");
        _stream.Append(CultureInfo.InvariantCulture, $"{rFill:F3} {gFill:F3} {bFill:F3} rg\n");
        if (rStroke.HasValue)
        {
            _stream.Append(CultureInfo.InvariantCulture, $"{rStroke.Value:F3} {gStroke!.Value:F3} {bStroke!.Value:F3} RG\n");
            _stream.Append(CultureInfo.InvariantCulture, $"{strokeWidth:F2} w\n");
            _stream.Append(CultureInfo.InvariantCulture, $"{x:F2} {pdfY:F2} {width:F2} {height:F2} re B\n");
        }
        else
        {
            _stream.Append(CultureInfo.InvariantCulture, $"{x:F2} {pdfY:F2} {width:F2} {height:F2} re f\n");
        }
        _stream.Append("Q\n");
    }

    public void DrawLine(float x1, float topY1, float x2, float topY2, float r, float g, float b, float width = 1f)
    {
        var y1 = ToPdfY(topY1);
        var y2 = ToPdfY(topY2);
        _stream.Append(CultureInfo.InvariantCulture, $"q\n{r:F3} {g:F3} {b:F3} RG\n{width:F2} w\n{x1:F2} {y1:F2} m {x2:F2} {y2:F2} l S\nQ\n");
    }

    public void DrawText(string text, float x, float topY, string font, float fontSize,
        float r, float g, float b, bool alignRight = false)
    {
        if (string.IsNullOrEmpty(text)) return;

        var pdfY = ToPdfY(topY);
        var sanitized = EscapePdfString(text);

        float finalX = x;
        if (alignRight)
        {
            float charWidth = fontSize * 0.52f;
            float textWidth = text.Length * charWidth;
            finalX = Math.Max(28f, x - textWidth);
        }

        _stream.Append(CultureInfo.InvariantCulture,
            $"BT\n{font} {fontSize:F1} Tf\n{r:F3} {g:F3} {b:F3} rg\n{finalX:F2} {pdfY:F2} Td\n({sanitized}) Tj\nET\n");
    }

    private static string EscapePdfString(string input)
    {
        var sb = new StringBuilder(input.Length + 16);
        foreach (var c in input)
        {
            switch (c)
            {
                case '(': sb.Append("\\("); break;
                case ')': sb.Append("\\)"); break;
                case '\\': sb.Append("\\\\"); break;
                case 'á': sb.Append("a"); break;
                case 'é': sb.Append("e"); break;
                case 'í': sb.Append("i"); break;
                case 'ó': sb.Append("o"); break;
                case 'ú': sb.Append("u"); break;
                case 'Á': sb.Append("A"); break;
                case 'É': sb.Append("E"); break;
                case 'Í': sb.Append("I"); break;
                case 'Ó': sb.Append("O"); break;
                case 'Ú': sb.Append("U"); break;
                case 'ñ': sb.Append("n"); break;
                case 'Ñ': sb.Append("N"); break;
                case 'º': sb.Append(".o"); break;
                case '°': sb.Append(".o"); break;
                default:
                    if (c >= 32 && c <= 126) sb.Append(c);
                    else sb.Append(' ');
                    break;
            }
        }
        return sb.ToString();
    }

    public byte[] BuildPdfBytes()
    {
        var streamBytes = Encoding.ASCII.GetBytes(_stream.ToString());

        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, Encoding.ASCII);

        var offsets = new List<long>();

        writer.Write("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
        writer.Flush();

        // Objeto 1: Catálogo
        offsets.Add(ms.Position);
        writer.Write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
        writer.Flush();

        // Objeto 2: Árbol de Páginas
        offsets.Add(ms.Position);
        writer.Write("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
        writer.Flush();

        // Objeto 3: Página A4
        offsets.Add(ms.Position);
        writer.Write(string.Format(CultureInfo.InvariantCulture,
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {0:F2} {1:F2}] /Resources 4 0 R /Contents 5 0 R >>\nendobj\n", PageWidth, PageHeight));
        writer.Flush();

        // Objeto 4: Recursos (Fuentes estándar)
        offsets.Add(ms.Position);
        writer.Write("4 0 obj\n<< /Font << " +
                     "/F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> " +
                     "/F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> " +
                     "/F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> " +
                     ">> >>\nendobj\n");
        writer.Flush();

        // Objeto 5: Stream de contenido
        offsets.Add(ms.Position);
        writer.Write($"5 0 obj\n<< /Length {streamBytes.Length} >>\nstream\n");
        writer.Flush();
        ms.Write(streamBytes, 0, streamBytes.Length);
        writer.Write("\nendstream\nendobj\n");
        writer.Flush();

        // Objeto 6: Metadatos Info
        offsets.Add(ms.Position);
        writer.Write("6 0 obj\n<< /Title (Comprobante de Cierre de Caja) /Author (Restaurante Girasoles) /Creator (GirasolesRes Backend) >>\nendobj\n");
        writer.Flush();

        // Tabla de Referencias Cruzadas (xref)
        var startXref = ms.Position;
        writer.Write($"xref\n0 {offsets.Count + 1}\n");
        writer.Write("0000000000 65535 f \n");
        foreach (var off in offsets)
        {
            writer.Write($"{off:D10} 00000 n \n");
        }

        // Trailer
        writer.Write($"trailer\n<< /Size {offsets.Count + 1} /Root 1 0 R /Info 6 0 R >>\n");
        writer.Write($"startxref\n{startXref}\n%%EOF\n");
        writer.Flush();

        return ms.ToArray();
    }
}
