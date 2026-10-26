using System.ComponentModel.DataAnnotations;
using GirasolesRes.Application.Common;

namespace GirasolesRes.Application.DTOs.Caja;

// =========================================================================
// 1. CONSULTA DE ESTADO ACTUAL (GET /api/caja/actual)
// =========================================================================

public record AperturaActualDto(
    Guid CajaId,
    DateTime FechaApertura,
    string FechaAperturaLocal,
    decimal MontoInicial,
    Guid IdUsuarioApertura,
    string NombreUsuarioApertura
);

public record ResumenParcialDto(
    decimal TotalVentas,
    decimal TotalEfectivo,
    decimal TotalYape,
    int CantidadVentas
);

public record CajaEstadoResponseDto(
    string Estado, // "sinCaja" | "abierta" | "anteriorSinCerrar"
    string? Mensaje,
    AperturaActualDto? Apertura,
    ResumenParcialDto? ResumenParcial,
    decimal? SugerenciaMontoInicial
);

// =========================================================================
// 2. APERTURA DE CAJA (POST /api/caja/abrir)
// =========================================================================

public class AbrirCajaRequestDto
{
    public string? SolicitudId { get; set; }

    public decimal? MontoInicial { get; set; }

    // Compatibilidad hacia atrás si se envía montoApertura
    public decimal? MontoApertura
    {
        get => MontoInicial;
        set => MontoInicial = value;
    }
}

public class AbrirCajaRequest : AbrirCajaRequestDto
{
}

public record CajaResponseDto(
    Guid CajaId,
    decimal MontoInicial,
    DateTime FechaApertura,
    DateTime FechaAperturaUtc,
    string FechaAperturaLocal,
    string Estado,
    string Mensaje,
    string Message,
    string SolicitudId,
    Guid IdUsuarioApertura,
    string? NombreUsuarioApertura,
    CajaDetalleAperturaDto? Caja = null
);

public record CajaDetalleAperturaDto(
    Guid IdCaja,
    decimal MontoApertura
);

// =========================================================================
// 3. RESUMEN DE CIERRE (GET /api/caja/cierre/resumen)
// =========================================================================

public record PlatoVendidoResumenDto(
    string Nombre,
    int Cantidad,
    decimal Total
)
{
    public decimal Monto => Total;
}

public record MenuCompletoCierreDto(
    int MenuCompletoId,
    string Nombre,
    int Cantidad,
    decimal Monto
)
{
    public decimal Total => Monto;
}

public record ComponenteCierreDto(
    Guid ProductoId,
    string Producto,
    string Rol,
    int Cantidad
);

public record PedidoPendienteCierreDto(
    Guid PedidoId,
    int Numero,
    string Tipo,
    string? Mesa,
    decimal Total
);

public record ResumenCierreResponseDto(
    Guid CajaId,
    DateTime FechaApertura,
    string FechaAperturaLocal,
    decimal MontoInicial,
    decimal VentasEfectivo,
    decimal Efectivo, // Alias para compatibilidad de pruebas
    decimal VentasYape,
    decimal Yape, // Alias para compatibilidad de pruebas
    decimal TotalVentas,
    decimal Total, // Alias para compatibilidad de pruebas
    decimal EfectivoEsperado,
    int CantidadVentas,
    IReadOnlyList<PlatoVendidoResumenDto> PlatosVendidos,
    IReadOnlyList<PedidoPendienteCierreDto> PedidosPendientes,
    IReadOnlyList<MenuCompletoCierreDto>? MenusCompletos = null,
    IReadOnlyList<ComponenteCierreDto>? Componentes = null,
    IReadOnlyList<PlatoVendidoResumenDto>? ProductosCarta = null
);

// =========================================================================
// 4. CIERRE Y CUADRE DE CAJA (POST /api/caja/cerrar)
// =========================================================================

public class CerrarCajaRequestDto
{
    public string? SolicitudId { get; set; }

    public decimal? EfectivoContado { get; set; }

    public decimal? EfectivoEsperadoMostrado { get; set; }

    [MaxLength(200, ErrorMessage = MensajesCatalogo.MSG_179)]
    public string? Observacion { get; set; }
}

public class CerrarCajaRequest : CerrarCajaRequestDto
{
}

public record CierreResponseDto(
    Guid CajaId,
    Guid CierreId,
    Guid Id,
    decimal MontoInicial,
    decimal EfectivoEsperado,
    decimal EfectivoContado,
    decimal Diferencia,
    string EstadoCuadre, // "Cuadra" | "Sobrante" | "Faltante"
    string Mensaje,
    string Message,
    DateTime? FechaCierreUtc,
    string? FechaCierreLocal,
    string? SolicitudId
);

// =========================================================================
// 5. HISTORIAL DE CIERRES PAGINADO (GET /api/caja/cierres)
// =========================================================================

public record CierreItemHistorialDto(
    Guid Id,
    Guid CajaId,
    Guid CierreId,
    DateTime FechaApertura,
    string FechaAperturaLocal,
    DateTime? FechaCierre,
    string? FechaCierreLocal,
    string Cajero,
    string CajeroApertura,
    string? CajeroCierre,
    decimal MontoInicial,
    decimal? MontoCierre,
    decimal? EfectivoContado,
    decimal? EfectivoEsperado,
    decimal? Diferencia,
    decimal VentasEfectivo,
    decimal VentasYape,
    decimal TotalVentas,
    string Estado, // "Abierta" | "Cerrada"
    string? Resultado, // "cuadra" | "sobrante" | "faltante" | null
    bool TieneAjustesPosteriores,
    bool ConAjustes,
    string? Observacion
)
{
    public decimal Efectivo => VentasEfectivo;
    public decimal Yape => VentasYape;
    public decimal Total => TotalVentas;
};

public record HistorialCierresPaginadoDto(
    IReadOnlyList<CierreItemHistorialDto> Items,
    int Total,
    int Pagina,
    int Tamano,
    int TotalPaginas,
    string? Mensaje = null
);

// =========================================================================
// 6. DETALLE DE CIERRE Y AJUSTES POSTERIORES (GET /api/caja/cierres/{id})
// =========================================================================

public record AjustePosteriorDto(
    Guid VentaId,
    string Comprobante,
    DateTime FechaVentaUtc,
    string FechaVentaLocal,
    DateTime? FechaAnulacion,
    DateTime? FechaAnulacionUtc,
    string? FechaAnulacionLocal,
    decimal Total,
    string MetodoPago,
    string? Motivo,
    string? UsuarioAnulacion
);

public record CierreDetalleDto(
    Guid Id,
    Guid CajaId,
    Guid CierreId,
    DateTime FechaApertura,
    string FechaAperturaLocal,
    DateTime? FechaCierre,
    string? FechaCierreLocal,
    string CajeroApertura,
    string? CajeroCierre,
    string Estado,
    decimal MontoInicial,
    decimal VentasEfectivo,
    decimal VentasYape,
    decimal TotalVentas,
    decimal EfectivoEsperado,
    decimal? EfectivoContado,
    decimal? Diferencia,
    string? EstadoCuadre,
    string? Resultado,
    string? Observacion,
    int CantidadVentas,
    IReadOnlyList<PlatoVendidoResumenDto> Platos,
    IReadOnlyList<PlatoVendidoResumenDto> PlatosVendidos,
    IReadOnlyList<AjustePosteriorDto> AjustesPosteriores,
    IReadOnlyList<MenuCompletoCierreDto>? MenusCompletos = null,
    IReadOnlyList<ComponenteCierreDto>? Componentes = null,
    IReadOnlyList<PlatoVendidoResumenDto>? ProductosCarta = null
);

// =========================================================================
// 7. COMPROBANTE DE CIERRE VOUCHER (PDF)
// =========================================================================

public class CierreVoucherDto
{
    public Guid CajaId { get; set; }
    public string NumeroCierre { get; set; } = string.Empty;
    public DateTime FechaAperturaLocal { get; set; }
    public DateTime FechaCierreLocal { get; set; }
    public string CajeroApertura { get; set; } = string.Empty;
    public string CajeroCierre { get; set; } = string.Empty;
    public string? SolicitudIdCierre { get; set; }

    public decimal MontoInicial { get; set; }
    public decimal VentasEfectivo { get; set; }
    public decimal VentasYape { get; set; }
    public decimal TotalVentas { get; set; }
    public int CantidadVentas { get; set; }

    public decimal EfectivoEsperado { get; set; }
    public decimal EfectivoContado { get; set; }
    public decimal Diferencia { get; set; }
    public string EstadoCuadre { get; set; } = "Cuadra";

    public string? Observacion { get; set; }

    public List<PlatoVendidoVoucherDto> PlatosVendidos { get; set; } = new();
    public List<MenuCompletoCierreDto> MenusCompletos { get; set; } = new();
    public List<ComponenteCierreDto> Componentes { get; set; } = new();
}

public class PlatoVendidoVoucherDto
{
    public string Nombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitarioPromedio { get; set; }
    public decimal Subtotal { get; set; }
}

// =========================================================================
// 8. COMPATIBILIDAD CON SERVICIOS PREEXISTENTES
// =========================================================================

public record CajaEstadoDto(
    bool EstaAbierta,
    Guid? CajaId,
    decimal? MontoApertura,
    DateTime? FechaAperturaUtc,
    string? FechaAperturaLocal,
    string? CajeroNombre
);
