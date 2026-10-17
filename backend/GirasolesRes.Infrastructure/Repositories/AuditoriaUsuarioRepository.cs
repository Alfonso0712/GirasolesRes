using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;

namespace GirasolesRes.Infrastructure.Repositories;

public class AuditoriaUsuarioRepository : IAuditoriaUsuarioRepository
{
    private readonly GirasolesDbContext _context;

    public AuditoriaUsuarioRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarAsync(AuditoriaUsuario auditoria, CancellationToken cancellationToken = default)
    {
        await _context.AuditoriasUsuario.AddAsync(auditoria, cancellationToken);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
