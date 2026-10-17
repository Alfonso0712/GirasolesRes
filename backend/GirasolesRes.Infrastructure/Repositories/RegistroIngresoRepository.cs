using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;

namespace GirasolesRes.Infrastructure.Repositories;

public class RegistroIngresoRepository : IRegistroIngresoRepository
{
    private readonly GirasolesDbContext _context;

    public RegistroIngresoRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarAsync(RegistroIngreso registro, CancellationToken cancellationToken = default)
    {
        await _context.RegistrosIngreso.AddAsync(registro, cancellationToken);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
