using GirasolesRes.Application.DTOs.Caja;

namespace GirasolesRes.Application.Interfaces.Services;

/// <summary>
/// Contrato de servicio de aplicación para la gestión de caja, apertura, cierre, arqueo e historial (CUS 13).
/// </summary>
public interface ICajaService
{
    /// <summary>
    /// Consulta el estado actual de la caja (sinCaja, abierta, anteriorSinCerrar),
    /// datos de apertura, balance acumulado parcial y sugerencia de monto inicial (CUS 13.1, RV-132, E-286, E-295).
    /// </summary>
    Task<CajaEstadoResponseDto> ConsultarEstadoActualAsync(Guid? usuarioId = null, CancellationToken ct = default);

    /// <summary>
    /// Alias para consulta de caja actual.
    /// </summary>
    Task<CajaEstadoResponseDto> ObtenerCajaActualAsync(CancellationToken ct = default);

    /// <summary>
    /// Registra la apertura de una nueva caja con validación de monto, unicidad diaria,
    /// bloqueo por día anterior sin cerrar e idempotencia por solicitudId (CUS 13.1, RV-119..RV-121, RN-107, RN-108).
    /// </summary>
    Task<CajaResponseDto> AbrirCajaAsync(AbrirCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default);

    /// <summary>
    /// Genera el resumen en tiempo real para el cierre de caja a partir de ventas vigentes,
    /// verificando pedidos pendientes de cobro y agrupando platos vendidos (CUS 13.2, RV-122, RV-123, RN-109, RN-110).
    /// </summary>
    Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(CancellationToken ct = default);

    /// <summary>
    /// Sobrecarga con usuarioId para obtener resumen de cierre.
    /// </summary>
    Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(Guid usuarioId, CancellationToken ct = default);

    /// <summary>
    /// Ejecuta el cierre atómico y definitivo de la caja, verificando ausencia de pedidos pendientes,
    /// detección de concurrencia en efectivo esperado, cálculo del cuadre y persistencia inmutable (CUS 13.2, RV-124..RV-129, RN-111, RN-112).
    /// </summary>
    Task<CierreResponseDto> CerrarCajaAsync(CerrarCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default);

    /// <summary>
    /// Consulta paginada del historial de cierres de caja con filtros de fechas validados
    /// e inclusión de la caja abierta actual en la primera posición si corresponde (CUS 13.3, RV-130, RV-131, RN-106, E-313..E-321).
    /// </summary>
    Task<HistorialCierresPaginadoDto> ObtenerHistorialCierresAsync(DateTime? desde, DateTime? hasta, int pagina, int tamano, CancellationToken ct = default);

    /// <summary>
    /// Consulta el detalle exhaustivo de un cierre de caja por su Id, incluyendo platos vendidos
    /// y lista de ajustes posteriores por ventas anuladas post-cierre (CUS 13.3, Vista 13.4, RN-113, E-317).
    /// </summary>
    Task<CierreDetalleDto> ObtenerDetalleCierreAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Genera el archivo PDF de 1 página correspondiente al comprobante de cierre de caja (RNF-48, E-307).
    /// </summary>
    Task<byte[]> GenerarPdfCierreAsync(Guid id, CancellationToken ct = default);

    // ==========================================
    // Métodos heredados para retrocompatibilidad
    // ==========================================
    Task<CajaEstadoDto> ObtenerEstadoCajaAsync(CancellationToken ct = default);
    Task<CajaEstadoDto> AbrirCajaAsync(AbrirCajaRequest request, Guid usuarioId, string nombreUsuario, CancellationToken ct = default);
}
