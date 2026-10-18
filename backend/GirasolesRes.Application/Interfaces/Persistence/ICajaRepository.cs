using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface ICajaRepository
{
    Task<Caja?> ObtenerCajaAbiertaActualAsync(CancellationToken ct = default);
    Task<Caja?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
    Task AgregarAsync(Caja caja, CancellationToken ct = default);
    Task ActualizarAsync(Caja caja, CancellationToken ct = default);
}
