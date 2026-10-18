using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IAuditoriaMesaRepository
{
    Task RegistrarAsync(AuditoriaMesa auditoria, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
