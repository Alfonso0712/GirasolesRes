using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;

namespace GirasolesRes.Infrastructure.Repositories;

public class AuditoriaMesaRepository : IAuditoriaMesaRepository
{
    private readonly GirasolesDbContext _context;

    public AuditoriaMesaRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarAsync(AuditoriaMesa auditoria, CancellationToken cancellationToken = default)
    {
        await _context.AuditoriasMesa.AddAsync(auditoria, cancellationToken);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
