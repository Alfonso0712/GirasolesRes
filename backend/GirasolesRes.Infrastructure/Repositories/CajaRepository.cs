using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class CajaRepository : ICajaRepository
{
    private readonly GirasolesDbContext _context;

    public CajaRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<Caja?> ObtenerCajaAbiertaActualAsync(CancellationToken ct = default)
    {
        return await _context.Cajas
            .Include(c => c.Caj_Usuario)
            .OrderByDescending(c => c.Caj_FechaAperturaUtc)
            .FirstOrDefaultAsync(c => c.Caj_Estado == EstadoCaja.Abierta, ct);
    }

    public async Task<Caja?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Cajas
            .Include(c => c.Caj_Usuario)
            .FirstOrDefaultAsync(c => c.Id_Caja == id, ct);
    }

    public async Task AgregarAsync(Caja caja, CancellationToken ct = default)
    {
        await _context.Cajas.AddAsync(caja, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Caja caja, CancellationToken ct = default)
    {
        _context.Cajas.Update(caja);
        await _context.SaveChangesAsync(ct);
    }
}
