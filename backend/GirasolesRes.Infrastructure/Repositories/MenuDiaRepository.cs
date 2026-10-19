using GirasolesRes.Application.Common;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class MenuDiaRepository : IMenuDiaRepository
{
    private readonly GirasolesDbContext _context;

    public MenuDiaRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<MenuDia?> ObtenerPorFechaAsync(DateOnly fecha, CancellationToken cancellationToken = default)
    {
        return await _context.MenusDia
            .Include(m => m.Men_Desayuno)
            .Include(m => m.Men_Platos)
                .ThenInclude(p => p.Mdp_Producto)
            .Include(m => m.Men_MenusCompletos)
                .ThenInclude(mc => mc.Mmc_MenuCompleto)
                    .ThenInclude(mcp => mcp.Men_Partes)
            .FirstOrDefaultAsync(m => m.Men_Fecha == fecha, cancellationToken);
    }

    public async Task<MenuDia?> ObtenerMenuHoyConDetalleAsync(CancellationToken cancellationToken = default)
    {
        var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();
        return await _context.MenusDia
            .Include(m => m.Men_Desayuno)
            .Include(m => m.Men_Platos)
                .ThenInclude(p => p.Mdp_Producto)
            .Include(m => m.Men_MenusCompletos)
                .ThenInclude(mc => mc.Mmc_MenuCompleto)
                    .ThenInclude(mcp => mcp.Men_Partes)
            .FirstOrDefaultAsync(m => m.Men_Fecha == fechaHoy, cancellationToken);
    }

    public async Task<bool> ExisteMenuHoyAsync(CancellationToken cancellationToken = default)
    {
        var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();
        return await _context.MenusDia.AnyAsync(m => m.Men_Fecha == fechaHoy, cancellationToken);
    }

    public async Task AgregarAsync(MenuDia menuDia, CancellationToken cancellationToken = default)
    {
        await _context.MenusDia.AddAsync(menuDia, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ActualizarAsync(MenuDia menuDia, CancellationToken cancellationToken = default)
    {
        if (_context.Entry(menuDia).State == EntityState.Detached)
        {
            _context.MenusDia.Update(menuDia);
        }

        // 1. Synchronize MenuDiaPlatos
        var currentPlatoIds = menuDia.Men_Platos.Select(p => p.Id_MenuPlato).ToHashSet();
        var platosToDelete = await _context.MenuDiaPlatos
            .Where(p => p.Id_Menu == menuDia.Id_Menu && !currentPlatoIds.Contains(p.Id_MenuPlato))
            .ToListAsync(cancellationToken);

        if (platosToDelete.Count > 0)
        {
            _context.MenuDiaPlatos.RemoveRange(platosToDelete);
        }

        var existingPlatoIds = await _context.MenuDiaPlatos
            .Where(p => p.Id_Menu == menuDia.Id_Menu)
            .Select(p => p.Id_MenuPlato)
            .ToListAsync(cancellationToken);
        var existingPlatoSet = existingPlatoIds.ToHashSet();

        foreach (var plato in menuDia.Men_Platos)
        {
            var entry = _context.Entry(plato);
            if (entry.State == EntityState.Detached || 
                (entry.State == EntityState.Modified && !existingPlatoSet.Contains(plato.Id_MenuPlato)))
            {
                entry.State = EntityState.Added;
            }
        }

        // 2. Synchronize MenuDiaMenusCompletos
        var currentMcIds = menuDia.Men_MenusCompletos.Select(mc => mc.Id_MenuDiaMenuCompleto).ToHashSet();
        var mcToDelete = await _context.MenuDiaMenusCompletos
            .Where(mc => mc.Id_Menu == menuDia.Id_Menu && !currentMcIds.Contains(mc.Id_MenuDiaMenuCompleto))
            .ToListAsync(cancellationToken);

        if (mcToDelete.Count > 0)
        {
            _context.MenuDiaMenusCompletos.RemoveRange(mcToDelete);
        }

        var existingMcIds = await _context.MenuDiaMenusCompletos
            .Where(mc => mc.Id_Menu == menuDia.Id_Menu)
            .Select(mc => mc.Id_MenuDiaMenuCompleto)
            .ToListAsync(cancellationToken);
        var existingMcSet = existingMcIds.ToHashSet();

        foreach (var mc in menuDia.Men_MenusCompletos)
        {
            var entry = _context.Entry(mc);
            if (entry.State == EntityState.Detached ||
                (entry.State == EntityState.Modified && !existingMcSet.Contains(mc.Id_MenuDiaMenuCompleto)))
            {
                entry.State = EntityState.Added;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoverProductoDeMenuVigenteAsync(Guid productoId, string usuario, CancellationToken cancellationToken = default)
    {
        var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();
        var menu = await _context.MenusDia
            .Include(m => m.Men_Platos)
            .FirstOrDefaultAsync(m => m.Men_Fecha == fechaHoy, cancellationToken);

        if (menu != null)
        {
            menu.RemoverProducto(productoId, usuario);
        }
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
