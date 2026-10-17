using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IAuditoriaUsuarioRepository
{
    Task RegistrarAsync(AuditoriaUsuario auditoria, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
