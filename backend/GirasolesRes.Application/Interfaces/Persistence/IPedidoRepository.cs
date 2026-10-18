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
    Task AgregarAsync(Pedido pedido, CancellationToken ct = default);
    Task ActualizarAsync(Pedido pedido, CancellationToken ct = default);
    Task RegistrarAuditoriaAsync(AuditoriaPedido auditoria, CancellationToken ct = default);
}
