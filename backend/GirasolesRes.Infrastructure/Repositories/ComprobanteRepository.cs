using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class ComprobanteRepository : IComprobanteRepository
{
    private readonly GirasolesDbContext _context;

    public ComprobanteRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<Comprobante?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Comprobantes
            .Include(c => c.Com_Venta)
                .ThenInclude(v => v!.Ven_Pedido)
                    .ThenInclude(p => p!.Ped_Detalles)
            .Include(c => c.Com_Venta)
                .ThenInclude(v => v!.Ven_Usuario)
            .FirstOrDefaultAsync(c => c.Id_Comprobante == id, ct);
    }

    public async Task<Comprobante?> ObtenerPorVentaIdAsync(Guid ventaId, CancellationToken ct = default)
    {
        return await _context.Comprobantes
            .Include(c => c.Com_Venta)
                .ThenInclude(v => v!.Ven_Pedido)
                    .ThenInclude(p => p!.Ped_Detalles)
            .Include(c => c.Com_Venta)
                .ThenInclude(v => v!.Ven_Usuario)
            .FirstOrDefaultAsync(c => c.Id_Venta == ventaId, ct);
    }

    public async Task<int> ObtenerSiguienteNumeroCorrelativoAsync(string serie, CancellationToken ct = default)
    {
        var serieTrim = serie.Trim();
        var max = await _context.Comprobantes
            .Where(c => c.Com_Serie == serieTrim)
            .Select(c => (int?)c.Com_Numero)
            .MaxAsync(ct);

        return (max ?? 0) + 1;
    }

    public async Task AgregarAsync(Comprobante comprobante, CancellationToken ct = default)
    {
        await _context.Comprobantes.AddAsync(comprobante, ct);
        await _context.SaveChangesAsync(ct);
    }
}
