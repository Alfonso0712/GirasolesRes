using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class VentaRepository : IVentaRepository
{
    private readonly GirasolesDbContext _context;

    public VentaRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<Venta?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Ventas
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Detalles)
                    .ThenInclude(d => d.Det_Producto)
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Mesa)
            .Include(v => v.Ven_Usuario)
            .Include(v => v.Ven_Comprobante)
            .FirstOrDefaultAsync(v => v.Id_Venta == id, ct);
    }

    public async Task<Venta?> ObtenerPorSolicitudIdAsync(string solicitudId, CancellationToken ct = default)
    {
        var solTrim = solicitudId.Trim();
        return await _context.Ventas
            .Include(v => v.Ven_Pedido)
            .Include(v => v.Ven_Comprobante)
            .FirstOrDefaultAsync(v => v.Ven_SolicitudId == solTrim, ct);
    }

    public async Task<Venta?> ObtenerPorPedidoIdAsync(Guid pedidoId, CancellationToken ct = default)
    {
        return await _context.Ventas
            .Include(v => v.Ven_Comprobante)
            .FirstOrDefaultAsync(v => v.Id_Pedido == pedidoId, ct);
    }

    public async Task AgregarAsync(Venta venta, CancellationToken ct = default)
    {
        await _context.Ventas.AddAsync(venta, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Venta venta, CancellationToken ct = default)
    {
        _context.Ventas.Update(venta);
        await _context.SaveChangesAsync(ct);
    }

    public async Task RegistrarCobroTransaccionalAsync(
        Venta venta,
        Comprobante comprobante,
        Pedido pedido,
        Mesa? mesaALiberar,
        AuditoriaCobro auditoria,
        CancellationToken ct = default)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            await _context.Ventas.AddAsync(venta, ct);
            await _context.Comprobantes.AddAsync(comprobante, ct);

            _context.Pedidos.Update(pedido);

            if (mesaALiberar != null)
            {
                _context.Mesas.Update(mesaALiberar);
            }

            await _context.AuditoriasCobro.AddAsync(auditoria, ct);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
