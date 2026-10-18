using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IComandaRepository
{
    Task<List<Comanda>> ListarComandasCocinaAsync(DateOnly fechaOperativa);
    Task<Comanda?> ObtenerComandaPorIdAsync(Guid idComanda);
    Task ActualizarComandaAsync(Comanda comanda);
    Task GuardarAuditoriaAsync(AuditoriaPedido auditoria);
    Task<Pedido?> ObtenerPedidoConComandasAsync(Guid idPedido);
    Task ActualizarEstadoPedidoAsync(Guid idPedido, EstadoPedido nuevoEstado);
}
