using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IMesaRepository
{
    Task<Mesa?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Mesa?> ObtenerPorNombreNormalizadoAsync(string nombreNormalizado, CancellationToken cancellationToken = default);
    Task<bool> ExisteNombreNormalizadoAsync(string nombreNormalizado, Guid? excluirId = null, CancellationToken cancellationToken = default);
    Task<List<Mesa>> ListarMesasAsync(EstadoOcupacionMesa? estado = null, bool incluirInactivas = false, CancellationToken cancellationToken = default);
    Task AgregarAsync(Mesa mesa, CancellationToken cancellationToken = default);
    Task ActualizarAsync(Mesa mesa, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
