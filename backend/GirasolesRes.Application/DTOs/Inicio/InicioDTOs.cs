namespace GirasolesRes.Application.DTOs.Inicio;

public record InicioResponseDto(
    string Rol,
    string Fecha,
    Dictionary<string, BloqueResultadoDto> Bloques
);

public record BloqueResultadoDto(
    string Estado,
    object? Datos,
    string? Error = null
);

// Bloques para Administrador
public record BloqueVentasHoyDto(
    int NVentas,
    decimal Total,
    decimal Efectivo,
    decimal Yape
);

public record PlatoPrincipalDto(
    string Producto,
    int Cantidad
);

public record BloquePlatosHoyDto(
    int Total,
    List<PlatoPrincipalDto> Principales
);

public record BloquePedidosPorEstadoDto(
    int Pendiente,
    int EnPreparacion,
    int Listo,
    int PorCobrar,
    int Pagado,
    int Anulado
);

public record BloqueMesasDto(
    int Libres,
    int Ocupadas
);

public record BloqueCajaAdminDto(
    string Estado,
    string? Desde,
    string? Usuario,
    decimal? EfectivoEsperado
);

public record BloqueMenuAdminDto(
    bool Definido,
    int Platos,
    int Agotados
);

public record BloqueUltimoCierreDto(
    string? Fecha,
    string? Resultado,
    decimal? Diferencia
);

public record AlertaInicioDto(
    string Tipo,
    string Texto,
    string Enlace,
    int Prioridad
);

// Bloques para Cajero
public record BloqueCajaCajeroDto(
    string Estado,
    int Ventas,
    decimal Efectivo,
    decimal Yape,
    decimal Total,
    decimal MontoInicial,
    decimal TotalEsperado
);

public record BloquePorCobrarDto(
    int Cantidad,
    decimal Monto
);

public record BloqueListosDto(
    int Cantidad
);

// Bloques para Mozo
public record BloqueMisPedidosEnCursoDto(
    int Cantidad
);

public record BloqueMisListosDto(
    int Cantidad
);

// Bloques para Cocinero
public record BloqueComandasCocineroDto(
    int Pendientes,
    int EnPreparacion,
    int MasAntiguaMinutos
);

public record BloqueAgotadosCocineroDto(
    int Cantidad,
    List<string> Platos
);
