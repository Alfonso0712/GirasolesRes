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
            .FirstOrDefaultAsync(m => m.Men_Fecha == fecha, cancellationToken);
    }

    public async Task<MenuDia?> ObtenerMenuHoyConDetalleAsync(CancellationToken cancellationToken = default)
    {
        var fechaHoy = TimeZoneHelper.ObtenerFechaActualLima();
        return await _context.MenusDia
            .Include(m => m.Men_Desayuno)
            .Include(m => m.Men_Platos)
                .ThenInclude(p => p.Mdp_Producto)
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
        _context.MenusDia.Update(menuDia);
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
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
