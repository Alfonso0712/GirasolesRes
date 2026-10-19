using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class MenuCompletoRepository : IMenuCompletoRepository
{
    private readonly GirasolesDbContext _context;

    public MenuCompletoRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuCompleto>> ObtenerTodosAsync(bool soloActivos = false, CancellationToken cancellationToken = default)
    {
        var query = _context.MenusCompletos
            .Include(m => m.Men_Partes)
            .AsQueryable();

        if (soloActivos)
        {
            query = query.Where(m => m.Men_Activo);
        }

        return await query
            .OrderBy(m => m.Id_MenuCompleto)
            .ToListAsync(cancellationToken);
    }

    public async Task<MenuCompleto?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MenusCompletos
            .Include(m => m.Men_Partes)
            .FirstOrDefaultAsync(m => m.Id_MenuCompleto == id, cancellationToken);
    }

    public Task ActualizarAsync(MenuCompleto menuCompleto, CancellationToken cancellationToken = default)
    {
        _context.MenusCompletos.Update(menuCompleto);
        return Task.CompletedTask;
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
