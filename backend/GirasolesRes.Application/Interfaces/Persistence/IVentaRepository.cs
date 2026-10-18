using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IVentaRepository
{
    Task<Venta?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
    Task<Venta?> ObtenerPorSolicitudIdAsync(string solicitudId, CancellationToken ct = default);
    Task<Venta?> ObtenerPorPedidoIdAsync(Guid pedidoId, CancellationToken ct = default);
    Task AgregarAsync(Venta venta, CancellationToken ct = default);
    Task ActualizarAsync(Venta venta, CancellationToken ct = default);
    Task RegistrarCobroTransaccionalAsync(
        Venta venta,
        Comprobante comprobante,
        Pedido pedido,
        Mesa? mesaALiberar,
        AuditoriaCobro auditoria,
        CancellationToken ct = default);
}
