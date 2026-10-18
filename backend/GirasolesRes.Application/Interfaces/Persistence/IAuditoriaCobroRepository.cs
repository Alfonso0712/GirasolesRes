using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IAuditoriaCobroRepository
{
    Task RegistrarAsync(AuditoriaCobro auditoria, CancellationToken ct = default);
}
