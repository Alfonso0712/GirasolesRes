using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IMenuCompletoRepository
{
    Task<List<MenuCompleto>> ObtenerTodosAsync(bool soloActivos = false, CancellationToken cancellationToken = default);
    Task<MenuCompleto?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task ActualizarAsync(MenuCompleto menuCompleto, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
