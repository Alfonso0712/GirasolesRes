using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class MesaRepository : IMesaRepository
{
    private readonly GirasolesDbContext _context;

    public MesaRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<Mesa?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Mesas
            .FirstOrDefaultAsync(m => m.Id_Mesa == id, cancellationToken);
    }

    public async Task<Mesa?> ObtenerPorNombreNormalizadoAsync(string nombreNormalizado, CancellationToken cancellationToken = default)
    {
        return await _context.Mesas
            .FirstOrDefaultAsync(m => m.Mes_NombreNormalizado == nombreNormalizado, cancellationToken);
    }

    public async Task<bool> ExisteNombreNormalizadoAsync(string nombreNormalizado, Guid? excluirId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Mesas.AsQueryable();

        if (excluirId.HasValue)
        {
            query = query.Where(m => m.Id_Mesa != excluirId.Value);
        }

        return await query.AnyAsync(m => m.Mes_NombreNormalizado == nombreNormalizado, cancellationToken);
    }

    public async Task<List<Mesa>> ListarMesasAsync(EstadoOcupacionMesa? estado = null, bool incluirInactivas = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Mesas.AsNoTracking();

        if (!incluirInactivas)
        {
            query = query.Where(m => m.Mes_Activa);
        }

        if (estado.HasValue)
        {
            query = query.Where(m => m.Mes_Ocupacion == estado.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task AgregarAsync(Mesa mesa, CancellationToken cancellationToken = default)
    {
        await _context.Mesas.AddAsync(mesa, cancellationToken);
    }

    public Task ActualizarAsync(Mesa mesa, CancellationToken cancellationToken = default)
    {
        _context.Mesas.Update(mesa);
        return Task.CompletedTask;
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
