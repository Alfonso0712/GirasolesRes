using GirasolesRes.Application.DTOs.Ventas;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
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

    public async Task<(IReadOnlyList<Venta> Items, int Total, ResumenVentasDto Resumen)> ListarVentasAsync(
        string? busqueda,
        DateTime? desdeUtc,
        DateTime? hastaUtc,
        int pagina,
        int tamano,
        CancellationToken ct = default)
    {
        var query = _context.Ventas
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Mesa)
            .Include(v => v.Ven_Usuario)
            .Include(v => v.Ven_Comprobante)
            .AsQueryable();

        if (desdeUtc.HasValue)
        {
            query = query.Where(v => v.Ven_FechaHoraUtc >= desdeUtc.Value);
        }
        if (hastaUtc.HasValue)
        {
            query = query.Where(v => v.Ven_FechaHoraUtc <= hastaUtc.Value);
        }

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var bTrim = busqueda.Trim();
            if (int.TryParse(bTrim, out var correlativoNum))
            {
                query = query.Where(v => v.Ven_Comprobante != null &&
                    (v.Ven_Comprobante.Com_Numero == correlativoNum ||
                     (v.Ven_Comprobante.Com_Serie + "-" + v.Ven_Comprobante.Com_Numero.ToString("D6")).Contains(bTrim)));
            }
            else
            {
                var lower = bTrim.ToLower();
                query = query.Where(v => v.Ven_Comprobante != null &&
                    (v.Ven_Comprobante.Com_Serie + "-" + v.Ven_Comprobante.Com_Numero.ToString()).ToLower().Contains(lower));
            }
        }

        var allFiltered = await query.ToListAsync(ct);
        var total = allFiltered.Count;

        var resumen = new ResumenVentasDto(
            Vigentes: allFiltered.Count(v => v.Ven_Estado == EstadoVenta.Vigente),
            TotalVigente: allFiltered.Where(v => v.Ven_Estado == EstadoVenta.Vigente).Sum(v => v.Ven_Total),
            Efectivo: allFiltered.Where(v => v.Ven_Estado == EstadoVenta.Vigente && v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total),
            Yape: allFiltered.Where(v => v.Ven_Estado == EstadoVenta.Vigente && v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total),
            Anuladas: allFiltered.Count(v => v.Ven_Estado == EstadoVenta.Anulada)
        );

        var items = allFiltered
            .OrderByDescending(v => v.Ven_FechaHoraUtc)
            .Skip((pagina - 1) * tamano)
            .Take(tamano)
            .ToList();

        return (items.AsReadOnly(), total, resumen);
    }

    public async Task<Venta?> ObtenerDetalleVentaAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Ventas
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Detalles)
                    .ThenInclude(d => d.Det_Producto)
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Mesa)
            .Include(v => v.Ven_Usuario)
            .Include(v => v.Ven_Caja)
            .Include(v => v.Ven_Comprobante)
            .FirstOrDefaultAsync(v => v.Id_Venta == id, ct);
    }

    public async Task AnularVentaTransaccionalAsync(
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
            _context.Ventas.Update(venta);
            _context.Comprobantes.Update(comprobante);
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
