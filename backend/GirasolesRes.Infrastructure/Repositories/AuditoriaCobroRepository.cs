using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;

namespace GirasolesRes.Infrastructure.Repositories;

public class AuditoriaCobroRepository : IAuditoriaCobroRepository
{
    private readonly GirasolesDbContext _context;

    public AuditoriaCobroRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarAsync(AuditoriaCobro auditoria, CancellationToken ct = default)
    {
        await _context.AuditoriasCobro.AddAsync(auditoria, ct);
        await _context.SaveChangesAsync(ct);
    }
}
