using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class CodigoRecuperacionRepository : ICodigoRecuperacionRepository
{
    private readonly GirasolesDbContext _context;

    public CodigoRecuperacionRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task InvalidarCodigosActivosPorCorreoAsync(string correo, CancellationToken cancellationToken = default)
    {
        var normalizado = correo.Trim().ToLowerInvariant();
        var codigos = await _context.CodigosRecuperacion
            .Where(c => c.Correo.ToLower() == normalizado && !c.Usado)
            .ToListAsync(cancellationToken);

        foreach (var c in codigos)
        {
            c.Invalidar();
        }
    }

    public async Task<CodigoRecuperacion?> ObtenerUltimoValidoAsync(string correo, CancellationToken cancellationToken = default)
    {
        var normalizado = correo.Trim().ToLowerInvariant();
        return await _context.CodigosRecuperacion
            .Where(c => c.Correo.ToLower() == normalizado && !c.Usado && c.FechaExpiracionUtc >= DateTime.UtcNow)
            .OrderByDescending(c => c.FechaCreacionUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AgregarAsync(CodigoRecuperacion codigo, CancellationToken cancellationToken = default)
    {
        await _context.CodigosRecuperacion.AddAsync(codigo, cancellationToken);
    }

    public Task ActualizarAsync(CodigoRecuperacion codigo, CancellationToken cancellationToken = default)
    {
        _context.CodigosRecuperacion.Update(codigo);
        return Task.CompletedTask;
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
