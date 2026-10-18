using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class PedidoRepository : IPedidoRepository
{
    private readonly GirasolesDbContext _context;

    public PedidoRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<Pedido?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Pedidos
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Producto)
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Include(p => p.Ped_Comandas)
                .ThenInclude(c => c.Cmd_Detalles)
            .FirstOrDefaultAsync(p => p.Id_Pedido == id, ct);
    }

    public async Task<Pedido?> ObtenerPorSolicitudIdAsync(string solicitudId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(solicitudId)) return null;

        return await _context.Pedidos
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Producto)
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Include(p => p.Ped_Comandas)
                .ThenInclude(c => c.Cmd_Detalles)
            .FirstOrDefaultAsync(p => p.Ped_SolicitudId == solicitudId.Trim(), ct);
    }

    public async Task<Pedido?> ObtenerPedidoActivoPorMesaAsync(Guid mesaId, CancellationToken ct = default)
    {
        return await _context.Pedidos
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Producto)
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Include(p => p.Ped_Comandas)
                .ThenInclude(c => c.Cmd_Detalles)
            .Where(p => p.Id_Mesa == mesaId &&
                        p.Ped_Estado != EstadoPedido.Pagado &&
                        p.Ped_Estado != EstadoPedido.Anulado)
            .OrderByDescending(p => p.Ped_FechaHoraUtc)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<bool> ExistePedidoActivoEnMesaAsync(Guid mesaId, CancellationToken ct = default)
    {
        return await _context.Pedidos.AnyAsync(p =>
            p.Id_Mesa == mesaId &&
            p.Ped_Estado != EstadoPedido.Pagado &&
            p.Ped_Estado != EstadoPedido.Anulado, ct);
    }

    public async Task<int> ObtenerSiguienteNumeroDiarioAsync(DateOnly fechaOperativa, CancellationToken ct = default)
    {
        var maxNumero = await _context.Pedidos
            .Where(p => p.Ped_FechaOperativa == fechaOperativa)
            .Select(p => (int?)p.Ped_NumeroDiario)
            .MaxAsync(ct);

        return (maxNumero ?? 0) + 1;
    }

    public async Task<int> ObtenerSiguienteNumeroComandaDiarioAsync(DateOnly fechaOperativa, CancellationToken ct = default)
    {
        var inicioDiaUtc = fechaOperativa.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var finDiaUtc = fechaOperativa.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        var maxNumero = await _context.Comandas
            .Where(c => c.Cmd_FechaHoraUtc >= inicioDiaUtc && c.Cmd_FechaHoraUtc <= finDiaUtc)
            .Select(c => (int?)c.Cmd_NumeroDiario)
            .MaxAsync(ct);

        return (maxNumero ?? 0) + 1;
    }

    public async Task<IReadOnlyList<Pedido>> ListarPedidosDelDiaAsync(DateOnly fechaOperativa, CancellationToken ct = default)
    {
        return await _context.Pedidos
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Producto)
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Where(p => p.Ped_FechaOperativa == fechaOperativa)
            .OrderByDescending(p => p.Ped_FechaHoraUtc)
            .ToListAsync(ct);
    }

    public async Task AgregarAsync(Pedido pedido, CancellationToken ct = default)
    {
        await _context.Pedidos.AddAsync(pedido, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Pedido pedido, CancellationToken ct = default)
    {
        foreach (var detalle in pedido.Ped_Detalles)
        {
            var entry = _context.Entry(detalle);
            if (entry.State == EntityState.Detached || 
               (entry.State == EntityState.Modified && !_context.DetallesPedido.Any(d => d.Id_Detalle == detalle.Id_Detalle)))
            {
                entry.State = EntityState.Added;
            }
        }

        foreach (var comanda in pedido.Ped_Comandas)
        {
            var entry = _context.Entry(comanda);
            if (entry.State == EntityState.Detached || 
               (entry.State == EntityState.Modified && !_context.Comandas.Any(c => c.Id_Comanda == comanda.Id_Comanda)))
            {
                entry.State = EntityState.Added;
            }

            foreach (var detComanda in comanda.Cmd_Detalles)
            {
                var entryDet = _context.Entry(detComanda);
                if (entryDet.State == EntityState.Detached || 
                   (entryDet.State == EntityState.Modified && !_context.DetallesComanda.Any(dc => dc.Id_DetalleComanda == detComanda.Id_DetalleComanda)))
                {
                    entryDet.State = EntityState.Added;
                }
            }
        }

        await _context.SaveChangesAsync(ct);
    }

    public async Task RegistrarAuditoriaAsync(AuditoriaPedido auditoria, CancellationToken ct = default)
    {
        await _context.AuditoriasPedido.AddAsync(auditoria, ct);
        await _context.SaveChangesAsync(ct);
    }
}
