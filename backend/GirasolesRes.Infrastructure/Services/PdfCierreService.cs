using System.Globalization;
using System.Text;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Common;

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

        var todosDetalles = caja.Caj_Ventas
            .Where(v => v.Ven_Estado == EstadoVenta.Vigente && v.Ven_Pedido != null)
            .SelectMany(v => v.Ven_Pedido!.Ped_Detalles)
            .ToList();

        // 1. Productos de Carta
        var platosVendidos = todosDetalles
            .Where(d => !d.Id_MenuCompleto.HasValue)
            .GroupBy(d => d.Det_Producto != null ? d.Det_Producto.Pro_Nombre : (d.Det_Nombre ?? "Producto General"))
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

        // 2. Menús Completos
        var menusCompletos = todosDetalles
            .Where(d => d.Id_MenuCompleto.HasValue)
            .GroupBy(d => d.Id_MenuCompleto!.Value)
            .Select(g =>
            {
                var first = g.First();
                var nombre = !string.IsNullOrWhiteSpace(first.Det_Nombre)
                    ? first.Det_Nombre
                    : first.Det_MenuCompleto?.Men_Nombre ?? $"Menú #{g.Key}";
                return new MenuCompletoCierreDto(
                    MenuCompletoId: g.Key,
                    Nombre: nombre,
                    Cantidad: g.Sum(d => d.Det_Cantidad),
                    Monto: decimal.Round(g.Sum(d => d.Det_Subtotal), 2)
                );
            })
            .OrderByDescending(m => m.Cantidad)
            .ToList();

        // 3. Componentes (veces elegidas, sin monto)
        var componentes = todosDetalles
            .Where(d => d.Id_MenuCompleto.HasValue)
            .SelectMany(d => d.Det_Opciones.Select(o => new { Opcion = o, Cantidad = d.Det_Cantidad }))
            .GroupBy(x => x.Opcion.Id_Producto)
            .Select(g =>
            {
                var first = g.First().Opcion;
                return new ComponenteCierreDto(
                    ProductoId: g.Key,
                    Producto: first.Lpo_ProductoNombre,
                    Rol: first.Lpo_ParteNombre,
                    Cantidad: g.Sum(x => x.Cantidad)
                );
            })
            .OrderByDescending(c => c.Cantidad)
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
            PlatosVendidos = platosVendidos,
            MenusCompletos = menusCompletos,
            Componentes = componentes
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
        builder.DrawText("RUC: 20481234567 | Jr. Mariscal Castilla N° 1023 | Tel: 934127923", 28f, curY + 28f, "/F1", 7.5f, 0.40f, 0.40f, 0.40f);

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

        // --- 4. CONSOLIDADO EN TRES BLOQUES (D-017, RN-138, E-401) ---
        float rowHeight = 11.5f;

        // 4A. BLOQUE 1: PRODUCTOS DE CARTA (CANTIDAD Y MONTO)
        builder.DrawText("1. PRODUCTOS DE CARTA VENDIDOS EN EL TURNO", 28f, curY + 7f, "/F2", 7.5f, 0.282f, 0.157f, 0.075f);
        curY += 10f;
        builder.DrawFilledRect(28f, curY, 539.28f, 12f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("Cant.", 34f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Nombre del Producto / Plato", 70f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("P. Unit Prom.", 410f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f, alignRight: true);
        builder.DrawText("Subtotal (S/)", 525f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f, alignRight: true);
        curY += 12f;

        int totalCartaUnidades = 0;
        decimal totalCartaMonto = 0m;
        if (d.PlatosVendidos.Count == 0)
        {
            builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.98f, 0.98f, 0.98f);
            builder.DrawText("Sin productos de carta vendidos en este turno", 70f, curY + 8.5f, "/F3", 6.5f, 0.5f, 0.5f, 0.5f);
            curY += rowHeight;
        }
        else
        {
            int maxCarta = Math.Min(d.PlatosVendidos.Count, 5);
            for (int i = 0; i < maxCarta; i++)
            {
                var p = d.PlatosVendidos[i];
                totalCartaUnidades += p.Cantidad;
                totalCartaMonto += p.Subtotal;
                if (i % 2 == 1) builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.965f, 0.965f, 0.965f);
                builder.DrawText(p.Cantidad.ToString(), 34f, curY + 8.5f, "/F2", 6.5f, 0.2f, 0.2f, 0.2f);
                var nom = p.Nombre.Length > 50 ? p.Nombre[..50] + "..." : p.Nombre;
                builder.DrawText(nom, 70f, curY + 8.5f, "/F1", 6.5f, 0.15f, 0.15f, 0.15f);
                builder.DrawText($"S/ {p.PrecioUnitarioPromedio,6:F2}", 410f, curY + 8.5f, "/F1", 6.5f, 0.3f, 0.3f, 0.3f, alignRight: true);
                builder.DrawText($"S/ {p.Subtotal,7:F2}", 525f, curY + 8.5f, "/F2", 6.5f, 0.15f, 0.15f, 0.15f, alignRight: true);
                curY += rowHeight;
            }
            if (d.PlatosVendidos.Count > maxCarta)
            {
                var rest = d.PlatosVendidos.Skip(maxCarta).ToList();
                int rCant = rest.Sum(r => r.Cantidad);
                decimal rSub = rest.Sum(r => r.Subtotal);
                totalCartaUnidades += rCant;
                totalCartaMonto += rSub;
                builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.94f, 0.94f, 0.94f);
                builder.DrawText(rCant.ToString(), 34f, curY + 8.5f, "/F2", 6.5f, 0.2f, 0.2f, 0.2f);
                builder.DrawText($"Otros {rest.Count} productos de carta adicionales", 70f, curY + 8.5f, "/F3", 6.5f, 0.3f, 0.3f, 0.3f);
                builder.DrawText($"S/ {rSub,7:F2}", 525f, curY + 8.5f, "/F2", 6.5f, 0.15f, 0.15f, 0.15f, alignRight: true);
                curY += rowHeight;
            }
        }
        builder.DrawFilledRect(28f, curY, 539.28f, 12f, 0.92f, 0.92f, 0.92f);
        builder.DrawText($"Subtotal Carta: {totalCartaUnidades} unidades", 70f, curY + 8.5f, "/F2", 7f, 0.2f, 0.2f, 0.2f);
        builder.DrawText($"S/ {totalCartaMonto,7:F2}", 525f, curY + 8.5f, "/F2", 7f, 0.827f, 0.329f, 0.000f, alignRight: true);
        curY += 15f;

        // 4B. BLOQUE 2: MENÚS COMPLETOS (CANTIDAD Y MONTO)
        builder.DrawText("2. MENÚS COMPLETOS VENDIDOS EN EL TURNO", 28f, curY + 7f, "/F2", 7.5f, 0.282f, 0.157f, 0.075f);
        curY += 10f;
        builder.DrawFilledRect(28f, curY, 539.28f, 12f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("Cant.", 34f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Nombre del Menú Completo", 70f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Subtotal (S/)", 525f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f, alignRight: true);
        curY += 12f;

        int totalMenusUnidades = 0;
        decimal totalMenusMonto = 0m;
        if (d.MenusCompletos.Count == 0)
        {
            builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.98f, 0.98f, 0.98f);
            builder.DrawText("Sin menús completos vendidos en este turno", 70f, curY + 8.5f, "/F3", 6.5f, 0.5f, 0.5f, 0.5f);
            curY += rowHeight;
        }
        else
        {
            int maxMenus = Math.Min(d.MenusCompletos.Count, 4);
            for (int i = 0; i < maxMenus; i++)
            {
                var m = d.MenusCompletos[i];
                totalMenusUnidades += m.Cantidad;
                totalMenusMonto += m.Monto;
                if (i % 2 == 1) builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.965f, 0.965f, 0.965f);
                builder.DrawText(m.Cantidad.ToString(), 34f, curY + 8.5f, "/F2", 6.5f, 0.2f, 0.2f, 0.2f);
                var nom = m.Nombre.Length > 50 ? m.Nombre[..50] + "..." : m.Nombre;
                builder.DrawText(nom, 70f, curY + 8.5f, "/F1", 6.5f, 0.15f, 0.15f, 0.15f);
                builder.DrawText($"S/ {m.Monto,7:F2}", 525f, curY + 8.5f, "/F2", 6.5f, 0.15f, 0.15f, 0.15f, alignRight: true);
                curY += rowHeight;
            }
        }
        builder.DrawFilledRect(28f, curY, 539.28f, 12f, 0.92f, 0.92f, 0.92f);
        builder.DrawText($"Subtotal Menús Completos: {totalMenusUnidades} unidades", 70f, curY + 8.5f, "/F2", 7f, 0.2f, 0.2f, 0.2f);
        builder.DrawText($"S/ {totalMenusMonto,7:F2}", 525f, curY + 8.5f, "/F2", 7f, 0.827f, 0.329f, 0.000f, alignRight: true);
        curY += 15f;

        // 4C. BLOQUE 3: COMPONENTES ELEGIDOS EN MENÚS (VECES ELEGIDAS, SIN MONTO - RN-138)
        builder.DrawText("3. COMPONENTES ELEGIDOS EN MENÚS COMPLETOS (VECES ELEGIDAS, SIN MONTO - RN-138)", 28f, curY + 7f, "/F2", 7.5f, 0.282f, 0.157f, 0.075f);
        curY += 10f;
        builder.DrawFilledRect(28f, curY, 539.28f, 12f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("Veces", 34f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Componente / Insumo Elegido", 70f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Rol / Parte", 340f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f);
        builder.DrawText("Monto", 525f, curY + 8.5f, "/F2", 6.5f, 1.0f, 1.0f, 1.0f, alignRight: true);
        curY += 12f;

        int totalCompElecciones = 0;
        if (d.Componentes.Count == 0)
        {
            builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.98f, 0.98f, 0.98f);
            builder.DrawText("Sin componentes elegidos en este turno", 70f, curY + 8.5f, "/F3", 6.5f, 0.5f, 0.5f, 0.5f);
            curY += rowHeight;
        }
        else
        {
            int maxComp = Math.Min(d.Componentes.Count, 5);
            for (int i = 0; i < maxComp; i++)
            {
                var c = d.Componentes[i];
                totalCompElecciones += c.Cantidad;
                if (i % 2 == 1) builder.DrawFilledRect(28f, curY, 539.28f, rowHeight, 0.965f, 0.965f, 0.965f);
                builder.DrawText(c.Cantidad.ToString(), 34f, curY + 8.5f, "/F2", 6.5f, 0.2f, 0.2f, 0.2f);
                var nom = c.Producto.Length > 40 ? c.Producto[..40] + "..." : c.Producto;
                builder.DrawText(nom, 70f, curY + 8.5f, "/F1", 6.5f, 0.15f, 0.15f, 0.15f);
                builder.DrawText(c.Rol, 340f, curY + 8.5f, "/F1", 6.5f, 0.35f, 0.35f, 0.35f);
                builder.DrawText("S/ 0.00 (Incluido)", 525f, curY + 8.5f, "/F3", 6.5f, 0.4f, 0.4f, 0.4f, alignRight: true);
                curY += rowHeight;
            }
        }
        builder.DrawFilledRect(28f, curY, 539.28f, 12f, 0.92f, 0.92f, 0.92f);
        builder.DrawText($"Total Elecciones de Componentes: {totalCompElecciones} selecciones", 70f, curY + 8.5f, "/F2", 7f, 0.2f, 0.2f, 0.2f);
        builder.DrawText("S/ 0.00", 525f, curY + 8.5f, "/F3", 7f, 0.4f, 0.4f, 0.4f, alignRight: true);
        curY += 16f;

        // Limitar curY para asegurar que observaciones, firmas y pie siempre queden dentro de página 1 (RNF-48)
        if (curY > 660f) curY = 660f;

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

        return builder.BuildPdfBytes("Comprobante de Cierre de Caja");
    }
}

