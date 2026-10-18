namespace GirasolesRes.Application.DTOs.Ventas;

public record VentaItemDto(
    Guid VentaId,
    string Comprobante,
    DateTime FechaHora,
    string FechaHoraFormateada,
    int PedidoNumero,
    string Tipo,
    string? Mesa,
    string? Referencia,
    decimal Total,
    string Metodo,
    string Cajero,
    string Estado
);

public record ResumenVentasDto(
    int Vigentes,
    decimal TotalVigente,
    decimal Efectivo,
    decimal Yape,
    int Anuladas
);

public record ListarVentasResponseDto(
    IReadOnlyList<VentaItemDto> Items,
    int Total,
    int Pagina,
    int Tamano,
    ResumenVentasDto Resumen
);

public record LineaVentaDetalleDto(
    int Cantidad,
    string ProductoNombre,
    decimal PrecioUnitario,
    decimal Subtotal,
    string? Observacion
);

public record VentaDetalleDto(
    Guid VentaId,
    Guid ComprobanteId,
    string Comprobante,
    DateTime FechaHoraUtc,
    string FechaHoraFormateada,
    Guid PedidoId,
    int PedidoNumero,
    string Tipo,
    string? Mesa,
    string? Referencia,
    decimal Total,
    string Metodo,
    decimal? MontoRecibido,
    decimal? Vuelto,
    string? YapeReferencia,
    string Cajero,
    string Estado,
    bool CajaCerrada,
    IReadOnlyList<LineaVentaDetalleDto> Lineas,
    string? MotivoAnulacion,
    string? UsuarioAnulacion,
    string? FechaHoraAnulacionFormateada,
    string? DestinoPedido
);

public record AnularVentaRequest(
    string SolicitudId,
    string Motivo,
    string DestinoPedido
);

public record AnularVentaResponseDto(
    string Estado,
    string PedidoEstado,
    string Comprobante,
    string Mensaje
);
