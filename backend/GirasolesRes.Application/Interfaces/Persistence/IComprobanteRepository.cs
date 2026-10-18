using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IComprobanteRepository
{
    Task<Comprobante?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default);
    Task<Comprobante?> ObtenerPorVentaIdAsync(Guid ventaId, CancellationToken ct = default);
    Task<int> ObtenerSiguienteNumeroCorrelativoAsync(string serie, CancellationToken ct = default);
    Task AgregarAsync(Comprobante comprobante, CancellationToken ct = default);
}
