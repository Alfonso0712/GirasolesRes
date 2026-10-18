using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

/// <summary>
/// Contrato de persistencia para la gestión de cajas, arqueos y cierres (CUS 13).
/// </summary>
public interface ICajaRepository
{
    /// <summary>
    /// Obtiene la caja actualmente abierta en el sistema, incluyendo los datos del cajero que abrió.
    /// Retorna null si no hay ninguna caja abierta (RV-119, RN-107).
    /// </summary>
    Task<Caja?> ObtenerCajaAbiertaAsync(CancellationToken ct = default);

    /// <summary>
    /// Alias de compatibilidad hacia atrás con servicios preexistentes (CUS 11).
    /// </summary>
    Task<Caja?> ObtenerCajaAbiertaActualAsync(CancellationToken ct = default);

    /// <summary>
    /// Obtiene el registro de la última caja cerrada cronológicamente.
    /// Utilizado para pre-llenar la sugerencia de monto inicial en la apertura (E-288, HU34).
    /// </summary>
    Task<Caja?> ObtenerUltimaCajaCerradaAsync(CancellationToken ct = default);

    /// <summary>
    /// Detecta si existe una caja abierta cuya fecha de apertura corresponde a un día anterior
    /// al día actual en horario local de Perú (RN-108, MSG-168, E-291).
    /// </summary>
    /// <param name="fechaHoyLima">Fecha u hora actual en zona horaria de Lima (UTC-5).</param>
    /// <param name="ct">Token de cancelación.</param>
    Task<Caja?> ObtenerCajaAnteriorSinCerrarAsync(DateTime fechaHoyLima, CancellationToken ct = default);

    /// <summary>
    /// Obtiene una caja por su identificador único (Guid).
    /// </summary>
    Task<Caja?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Obtiene el detalle completo de un cierre de caja por su Id (Guid),
    /// incluyendo UsuarioApertura, UsuarioCierre, ventas asociadas, pedidos, comensales/mesas,
    /// comprobantes y detalles de platos vendidos (CUS 13.3, Vista 13.4, E-317, RNF-48).
    /// </summary>
    Task<Caja?> ObtenerPorIdConDetallesAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Busca una caja por su token de idempotencia (solicitudId de apertura o cierre)
    /// para evitar registros duplicados por doble clic o reintentos de red (RV-121, RN-114, E-292).
    /// </summary>
    Task<Caja?> ObtenerPorSolicitudIdAsync(string solicitudId, CancellationToken ct = default);

    /// <summary>
    /// Consulta paginada del historial de cierres de caja con filtros opcionales de rango de fechas (CUS 13.3, RV-130, E-313..E-321).
    /// Ordenado cronológicamente descendente (la caja abierta actual encabeza la primera página si coincide con el rango).
    /// </summary>
    /// <param name="desde">Fecha inicial del filtro (inclusive).</param>
    /// <param name="hasta">Fecha final del filtro (inclusive).</param>
    /// <param name="pagina">Número de página (1-based).</param>
    /// <param name="tamano">Cantidad de elementos por página (default 20 según RV-130).</param>
    /// <param name="ct">Token de cancelación.</param>
    Task<(List<Caja> Items, int Total)> ObtenerHistorialPaginadoAsync(
        DateTime? desde,
        DateTime? hasta,
        int pagina,
        int tamano,
        CancellationToken ct = default);

    /// <summary>
    /// Agrega una nueva entidad Caja a la base de datos (apertura) de manera persistente.
    /// </summary>
    Task AgregarAsync(Caja caja, CancellationToken ct = default);

    /// <summary>
    /// Actualiza una entidad Caja en la base de datos (cierre, auditoría) de manera persistente.
    /// </summary>
    Task ActualizarAsync(Caja caja, CancellationToken ct = default);

    /// <summary>
    /// Obtiene las ventas vigentes asociadas a una caja específica, con sus pedidos y productos,
    /// para el cálculo en tiempo real del resumen de cuadre y platos vendidos (RV-123, RN-109).
    /// </summary>
    Task<List<Venta>> ObtenerVentasPorCajaIdAsync(Guid cajaId, CancellationToken ct = default);
}
