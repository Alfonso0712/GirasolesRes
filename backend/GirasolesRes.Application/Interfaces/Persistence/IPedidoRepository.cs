using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IPedidoRepository
{
    Task<Pedido?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
    Task<Pedido?> ObtenerPorSolicitudIdAsync(string solicitudId, CancellationToken ct = default);
    Task<Pedido?> ObtenerPedidoActivoPorMesaAsync(Guid mesaId, CancellationToken ct = default);
    Task<bool> ExistePedidoActivoEnMesaAsync(Guid mesaId, CancellationToken ct = default);
    Task<int> ObtenerSiguienteNumeroDiarioAsync(DateOnly fechaOperativa, CancellationToken ct = default);
    Task<int> ObtenerSiguienteNumeroComandaDiarioAsync(DateOnly fechaOperativa, CancellationToken ct = default);
    Task<IReadOnlyList<Pedido>> ListarPedidosDelDiaAsync(DateOnly fechaOperativa, CancellationToken ct = default);
    Task<(IReadOnlyList<Pedido> Items, int Total, int Pendiente, int EnPreparacion, int Listo, int Pagado, int Anulado)> ListarPaginadoAsync(
        DateOnly fechaOperativa,
        string? estado,
        string? tipo,
        Guid? mesaId,
        Guid? usuarioIdFiltro,
        int pagina,
        int tamano,
        CancellationToken ct = default);
    Task<Pedido?> ObtenerDetalleCompletoPorIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Comanda>> ObtenerAvisosPendientesAsync(DateOnly fechaOperativa, Guid? usuarioId, bool esMozo, CancellationToken ct = default);
    Task<Comanda?> ObtenerComandaPorIdAsync(Guid comandaId, CancellationToken ct = default);
    Task ActualizarComandaAsync(Comanda comanda, CancellationToken ct = default);
    Task<bool> TieneOtrosPedidosAbiertosEnMesaAsync(Guid mesaId, Guid pedidoExcluidoId, CancellationToken ct = default);
    Task AgregarAsync(Pedido pedido, CancellationToken ct = default);
    Task ActualizarAsync(Pedido pedido, CancellationToken ct = default);
    Task RegistrarAuditoriaAsync(AuditoriaPedido auditoria, CancellationToken ct = default);
}
