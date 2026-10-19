using System.Globalization;
using GirasolesRes.Application.DTOs.Cobros;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Infrastructure.Common;

namespace GirasolesRes.Infrastructure.Services;

public class PdfComprobanteService : IPdfComprobanteService
{
    public byte[] GenerarPdfComprobante(ComprobanteDetalleDto detalle)
    {
        var builder = new PdfCanvasBuilder();
        float curY = 28f;

        // 1. Franja corporativa superior (#D35400)
        builder.DrawFilledRect(28f, curY, 539.28f, 4f, 0.827f, 0.329f, 0.000f);
        curY += 12f;

        // 2. Encabezado de la Empresa (Izquierda)
        builder.DrawText("RESTAURANTE GIRASOLES", 28f, curY + 14f, "/F2", 16f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("RUC: 20481234567 | Av. Principal 123 - Ayacucho", 28f, curY + 28f, "/F1", 8f, 0.40f, 0.40f, 0.40f);
        builder.DrawText("Teléfono: (066) 31-2345 | Email: contacto@girasoles.com", 28f, curY + 39f, "/F1", 7.5f, 0.45f, 0.45f, 0.45f);

        // 3. Tarjeta Oficial del Comprobante (Derecha)
        var tipoTitulo = detalle.TipoComprobante switch
        {
            "Factura" => "FACTURA ELECTRÓNICA",
            "Boleta" => "BOLETA DE VENTA ELECTRÓNICA",
            _ => "TICKET DE VENTA"
        };

        builder.DrawFilledRect(330f, curY, 237.28f, 52f, 0.984f, 0.976f, 0.965f, 0.827f, 0.329f, 0.000f, 1.2f);
        builder.DrawText("R.U.C. 20481234567", 340f, curY + 13f, "/F2", 10f, 0.282f, 0.157f, 0.075f);
        builder.DrawText(tipoTitulo, 340f, curY + 26f, "/F2", 10.5f, 0.827f, 0.329f, 0.000f);
        builder.DrawText($"N.o {detalle.NumeroFormateado}", 340f, curY + 38f, "/F2", 11f, 0.173f, 0.102f, 0.055f);
        builder.DrawText(detalle.EsCopia ? "*** COPIA DE REIMPRESIÓN ***" : "*** ORIGINAL ***", 340f, curY + 47f, "/F3", 7f, 0.50f, 0.50f, 0.50f);

        curY += 60f;
        builder.DrawLine(28f, curY, 567.28f, curY, 0.85f, 0.85f, 0.85f, 0.8f);
        curY += 10f;

        // 4. Datos del Pedido y Emisión (Cuadro superior)
        builder.DrawFilledRect(28f, curY, 539.28f, 32f, 0.975f, 0.975f, 0.975f, 0.88f, 0.88f, 0.88f, 0.5f);
        builder.DrawText($"Fecha y Hora : {detalle.FechaHoraFormateada}", 36f, curY + 12f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText($"Cajero(a)    : {detalle.CajeroNombre}", 36f, curY + 23f, "/F1", 8f, 0.20f, 0.20f, 0.20f);

        var destinoStr = string.IsNullOrWhiteSpace(detalle.MesaNombre) ? detalle.TipoPedido : $"{detalle.TipoPedido} ({detalle.MesaNombre})";
        builder.DrawText($"Pedido N.o   : #{detalle.PedidoNumero}", 300f, curY + 12f, "/F2", 8f, 0.20f, 0.20f, 0.20f);
        builder.DrawText($"Destino      : {destinoStr}", 300f, curY + 23f, "/F1", 8f, 0.20f, 0.20f, 0.20f);

        curY += 38f;

        // 5. Datos del Receptor / Cliente Fiscal
        if (!string.IsNullOrWhiteSpace(detalle.NumDocReceptor) || !string.IsNullOrWhiteSpace(detalle.RazonSocialReceptor))
        {
            builder.DrawFilledRect(28f, curY, 539.28f, 36f, 0.965f, 0.975f, 0.990f, 0.80f, 0.85f, 0.95f, 0.6f);
            var docLabel = detalle.TipoDocReceptor ?? (detalle.NumDocReceptor?.Length == 11 ? "RUC" : "DNI");
            builder.DrawText($"DATOS DEL CLIENTE / RECEPTOR ({docLabel})", 36f, curY + 10f, "/F2", 7.5f, 0.15f, 0.30f, 0.60f);

            builder.DrawText($"{docLabel}: {detalle.NumDocReceptor ?? "-"}", 36f, curY + 21f, "/F2", 8.5f, 0.17f, 0.17f, 0.17f);
            builder.DrawText($"Señor(es): {detalle.RazonSocialReceptor ?? "CLIENTES VARIOS"}", 160f, curY + 21f, "/F1", 8.5f, 0.17f, 0.17f, 0.17f);

            if (!string.IsNullOrWhiteSpace(detalle.DireccionReceptor))
            {
                builder.DrawText($"Dirección Fiscal: {detalle.DireccionReceptor}", 36f, curY + 31f, "/F1", 7.5f, 0.35f, 0.35f, 0.35f);
            }

            curY += 42f;
        }

        // 6. Tabla de Ítems Consumidos
        builder.DrawFilledRect(28f, curY, 539.28f, 18f, 0.282f, 0.157f, 0.075f);
        builder.DrawText("CANT.", 34f, curY + 12f, "/F2", 8f, 1f, 1f, 1f);
        builder.DrawText("DESCRIPCIÓN DEL PLATO / BEBIDA", 85f, curY + 12f, "/F2", 8f, 1f, 1f, 1f);
        builder.DrawText("P. UNIT.", 435f, curY + 12f, "/F2", 8f, 1f, 1f, 1f, alignRight: true);
        builder.DrawText("IMPORTE", 555f, curY + 12f, "/F2", 8f, 1f, 1f, 1f, alignRight: true);

        curY += 18f;

        bool alt = false;
        foreach (var linea in detalle.Lineas)
        {
            float rowH = string.IsNullOrWhiteSpace(linea.Observacion) ? 17f : 26f;

            if (alt)
            {
                builder.DrawFilledRect(28f, curY, 539.28f, rowH, 0.985f, 0.985f, 0.985f);
            }

            builder.DrawText(linea.Cantidad.ToString(CultureInfo.InvariantCulture), 42f, curY + 11f, "/F2", 8.5f, 0.17f, 0.17f, 0.17f);
            builder.DrawText(linea.ProductoNombre, 85f, curY + 11f, "/F1", 8.5f, 0.17f, 0.17f, 0.17f);
            builder.DrawText($"S/ {linea.PrecioUnitario:F2}", 435f, curY + 11f, "/F1", 8.5f, 0.25f, 0.25f, 0.25f, alignRight: true);
            builder.DrawText($"S/ {linea.Subtotal:F2}", 555f, curY + 11f, "/F2", 8.5f, 0.17f, 0.17f, 0.17f, alignRight: true);

            if (!string.IsNullOrWhiteSpace(linea.Observacion))
            {
                builder.DrawText($"* Nota: {linea.Observacion}", 95f, curY + 21f, "/F3", 7f, 0.45f, 0.45f, 0.45f);
            }

            builder.DrawLine(28f, curY + rowH, 567.28f, curY + rowH, 0.92f, 0.92f, 0.92f, 0.5f);
            curY += rowH;
            alt = !alt;
        }

        curY += 8f;

        // 7. Desglose Tributario y Totales
        // Bloque Izquierdo: Información de Pago
        builder.DrawFilledRect(28f, curY, 260f, 65f, 0.98f, 0.98f, 0.98f, 0.88f, 0.88f, 0.88f, 0.5f);
        builder.DrawText("INFORMACIÓN DE PAGO", 36f, curY + 12f, "/F2", 8f, 0.282f, 0.157f, 0.075f);
        builder.DrawText($"Forma de Pago  : {detalle.MetodoPago}", 36f, curY + 25f, "/F1", 8f, 0.20f, 0.20f, 0.20f);

        if (detalle.MetodoPago == "Efectivo")
        {
            var recibido = detalle.MontoRecibido ?? detalle.Total;
            builder.DrawText($"Monto Recibido : S/ {recibido:F2}", 36f, curY + 37f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
            builder.DrawText($"Vuelto         : S/ {(detalle.Vuelto ?? 0m):F2}", 36f, curY + 49f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
        }
        else if (detalle.MetodoPago == "Yape")
        {
            var refYape = string.IsNullOrWhiteSpace(detalle.YapeReferencia) ? "No especificada" : detalle.YapeReferencia;
            builder.DrawText($"Ref. Operación : {refYape}", 36f, curY + 37f, "/F1", 8f, 0.20f, 0.20f, 0.20f);
        }

        // Bloque Derecho: Totales e Impuestos
        builder.DrawFilledRect(300f, curY, 267.28f, 65f, 0.99f, 0.98f, 0.96f, 0.85f, 0.70f, 0.55f, 0.7f);

        float rightY = curY;
        if (detalle.TipoComprobante == "Boleta" || detalle.TipoComprobante == "Factura")
        {
            builder.DrawText("Op. Gravada (Base):", 312f, rightY + 14f, "/F1", 8f, 0.30f, 0.30f, 0.30f);
            builder.DrawText($"S/ {detalle.OpGravada:F2}", 555f, rightY + 14f, "/F1", 8f, 0.20f, 0.20f, 0.20f, alignRight: true);

            builder.DrawText("I.G.V. (18%):", 312f, rightY + 26f, "/F1", 8f, 0.30f, 0.30f, 0.30f);
            builder.DrawText($"S/ {detalle.Igv:F2}", 555f, rightY + 26f, "/F1", 8f, 0.20f, 0.20f, 0.20f, alignRight: true);

            builder.DrawLine(312f, rightY + 32f, 555f, rightY + 32f, 0.80f, 0.80f, 0.80f, 0.5f);
            rightY += 36f;
        }
        else
        {
            rightY += 18f;
        }

        builder.DrawText("IMPORTE TOTAL:", 312f, rightY + 13f, "/F2", 11f, 0.282f, 0.157f, 0.075f);
        builder.DrawText($"S/ {detalle.Total:F2}", 555f, rightY + 13f, "/F2", 13f, 0.827f, 0.329f, 0.000f, alignRight: true);

        curY += 78f;

        // 8. Pie de Página y Leyenda Legal
        builder.DrawLine(28f, curY, 567.28f, curY, 0.85f, 0.85f, 0.85f, 0.5f);
        curY += 12f;

        builder.DrawText(detalle.Leyenda, 28f, curY, "/F3", 7.5f, 0.40f, 0.40f, 0.40f);
        builder.DrawText("¡GRACIAS POR SU PREFERENCIA!", 297.64f, curY + 14f, "/F2", 9f, 0.282f, 0.157f, 0.075f, alignRight: true);
        builder.DrawText("Sistema Gastronómico GirasolesRes", 555f, curY + 14f, "/F1", 7f, 0.50f, 0.50f, 0.50f, alignRight: true);

        return builder.BuildPdfBytes($"Comprobante {detalle.NumeroFormateado}");
    }
}
