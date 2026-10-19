namespace GirasolesRes.Application.DTOs.Cobros;

public record ComprobanteLineaDto(
    int Cantidad,
    string ProductoNombre,
    decimal PrecioUnitario,
    decimal Subtotal,
    string? Observacion,
    string? Elecciones = null,
    string? Incluye = null
);

public record ComprobanteDetalleDto(
    Guid ComprobanteId,
    Guid VentaId,
    string Serie,
    int Numero,
    string NumeroFormateado,
    DateTime FechaHoraUtc,
    string FechaHoraFormateada,
    int PedidoNumero,
    string TipoPedido,
    string? MesaNombre,
    string? Referencia,
    string CajeroNombre,
    IReadOnlyList<ComprobanteLineaDto> Lineas,
    decimal Total,
    string MetodoPago,
    decimal? MontoRecibido,
    decimal? Vuelto,
    string? YapeReferencia,
    string Leyenda,
    bool EsCopia
);
