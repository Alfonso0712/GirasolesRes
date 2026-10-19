namespace GirasolesRes.Application.DTOs.Reportes;

public record ReporteVentasResponseDto(
    string Desde,
    string Hasta,
    int NVentas,
    decimal Total,
    decimal Efectivo,
    decimal Yape,
    VentasAnuladasResumenDto Anuladas,
    List<VentaPorDiaDto> PorDia
);

public record VentasAnuladasResumenDto(
    int Cantidad,
    decimal Monto
);

public record VentaPorDiaDto(
    string Fecha,
    int NVentas,
    decimal Efectivo,
    decimal Yape,
    decimal Total,
    bool ConAjustes
);

public record ItemMenuCompletoVendidoDto(
    int MenuCompletoId,
    string Nombre,
    int Cantidad,
    decimal Monto
);

public record ItemComponenteVendidoDto(
    Guid ProductoId,
    string Producto,
    string Rol,
    int Cantidad
);

public record ReportePlatosResponseDto(
    int TotalPlatos,
    decimal TotalMonto,
    decimal TotalVentas,
    bool Coincide,
    List<SubtotalCategoriaDto> Subtotales,
    List<ItemPlatoVendidoDto> Items,
    List<PlatoPorDiaDto>? PorDia,
    List<ItemMenuCompletoVendidoDto>? MenusCompletos = null,
    List<ItemComponenteVendidoDto>? Componentes = null
);

public record SubtotalCategoriaDto(
    string Categoria,
    int Cantidad,
    decimal Monto
);

public record ItemPlatoVendidoDto(
    Guid ProductoId,
    string Producto,
    string Categoria,
    bool Activo,
    int Cantidad,
    decimal Monto
);

public record PlatoPorDiaDto(
    string Fecha,
    int Cantidad
);
