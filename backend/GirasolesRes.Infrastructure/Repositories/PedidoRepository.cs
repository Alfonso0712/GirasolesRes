using GirasolesRes.Application.Common;
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
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_MenuCompleto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Opciones)
                    .ThenInclude(o => o.Lpo_Producto)
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
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_MenuCompleto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Opciones)
                    .ThenInclude(o => o.Lpo_Producto)
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Include(p => p.Ped_Comandas)
                .ThenInclude(c => c.Cmd_Detalles)
            .FirstOrDefaultAsync(p => p.Ped_SolicitudId == solicitudId.Trim(), ct);
    }

    public async Task<IReadOnlyList<Pedido>> ObtenerPedidosActivosPorMesaAsync(Guid mesaId, CancellationToken ct = default)
    {
        return await _context.Pedidos
            .Include(p => p.Ped_Comandas)
            .Where(p => p.Id_Mesa == mesaId &&
                        p.Ped_Estado != EstadoPedido.Pagado &&
                        p.Ped_Estado != EstadoPedido.Anulado)
            .OrderBy(p => p.Ped_NumeroDiario)
            .ToListAsync(ct);
    }

    public async Task<Pedido?> ObtenerPedidoActivoPorMesaAsync(Guid mesaId, CancellationToken ct = default)
    {
        return await _context.Pedidos
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Producto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_MenuCompleto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Opciones)
                    .ThenInclude(o => o.Lpo_Producto)
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
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_MenuCompleto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Opciones)
                    .ThenInclude(o => o.Lpo_Producto)
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

            foreach (var op in detalle.Det_Opciones)
            {
                var entryOp = _context.Entry(op);
                if (entryOp.State == EntityState.Detached ||
                   (entryOp.State == EntityState.Modified && !_context.LineasPedidoOpciones.Any(lpo => lpo.Id_LineaPedidoOpcion == op.Id_LineaPedidoOpcion)))
                {
                    entryOp.State = EntityState.Added;
                }
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

    public async Task<(IReadOnlyList<Pedido> Items, int Total, int Pendiente, int EnPreparacion, int Listo, int Pagado, int Anulado)> ListarPaginadoAsync(
        DateOnly fechaOperativa,
        string? estado,
        string? tipo,
        Guid? mesaId,
        Guid? usuarioIdFiltro,
        int pagina,
        int tamano,
        CancellationToken ct = default)
    {
        var baseQuery = _context.Pedidos
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Producto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_MenuCompleto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Opciones)
                    .ThenInclude(o => o.Lpo_Producto)
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Include(p => p.Ped_Comandas)
            .Where(p => p.Ped_FechaOperativa == fechaOperativa);

        if (usuarioIdFiltro.HasValue)
        {
            baseQuery = baseQuery.Where(p => p.Id_Usuario == usuarioIdFiltro.Value);
        }

        var todosPedidosDia = await baseQuery.ToListAsync(ct);

        int pendiente = 0;
        int enPreparacion = 0;
        int listo = 0;
        int pagado = 0;
        int anulado = 0;

        foreach (var p in todosPedidosDia)
        {
            var est = ResolverEstadoEfectivo(p);
            switch (est)
            {
                case EstadoPedido.Pendiente: pendiente++; break;
                case EstadoPedido.EnPreparacion: enPreparacion++; break;
                case EstadoPedido.Listo: listo++; break;
                case EstadoPedido.Pagado: pagado++; break;
                case EstadoPedido.Anulado: anulado++; break;
            }
        }

        var filtrados = todosPedidosDia.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(estado))
        {
            filtrados = filtrados.Where(p => ResolverEstadoEfectivo(p).ToString().Equals(estado, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(tipo) && Enum.TryParse<TipoPedido>(tipo, true, out var tipoEnum))
        {
            filtrados = filtrados.Where(p => p.Ped_Tipo == tipoEnum);
        }

        if (mesaId.HasValue)
        {
            filtrados = filtrados.Where(p => p.Id_Mesa == mesaId.Value);
        }

        var totalFiltrados = filtrados.Count();
        var items = filtrados
            .OrderByDescending(p => p.Ped_FechaHoraUtc)
            .Skip((pagina - 1) * tamano)
            .Take(tamano)
            .ToList();

        return (items, totalFiltrados, pendiente, enPreparacion, listo, pagado, anulado);
    }

    private static EstadoPedido ResolverEstadoEfectivo(Pedido p)
    {
        if (p.Ped_Estado == EstadoPedido.Pagado || p.Ped_Estado == EstadoPedido.Anulado)
        {
            return p.Ped_Estado;
        }

        var comandasValidas = p.Ped_Comandas.Where(c => c.Cmd_Estado != EstadoComanda.Cancelada).ToList();
        if (!comandasValidas.Any())
        {
            return p.Ped_Estado;
        }

        if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.EnPreparacion))
        {
            return EstadoPedido.EnPreparacion;
        }

        if (comandasValidas.Any(c => c.Cmd_Estado == EstadoComanda.Pendiente))
        {
            return EstadoPedido.Pendiente;
        }

        if (comandasValidas.All(c => c.Cmd_Estado == EstadoComanda.Lista))
        {
            return EstadoPedido.Listo;
        }

        return p.Ped_Estado;
    }

    public async Task<Pedido?> ObtenerDetalleCompletoPorIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Pedidos
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Producto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_MenuCompleto)
            .Include(p => p.Ped_Detalles)
                .ThenInclude(d => d.Det_Opciones)
                    .ThenInclude(o => o.Lpo_Producto)
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Include(p => p.Ped_Comandas)
                .ThenInclude(c => c.Cmd_Detalles)
            .FirstOrDefaultAsync(p => p.Id_Pedido == id, ct);
    }

    public async Task<IReadOnlyList<Comanda>> ObtenerAvisosPendientesAsync(DateOnly fechaOperativa, Guid? usuarioId, bool esCajero, CancellationToken ct = default)
    {
        var query = _context.Comandas
            .Include(c => c.Cmd_Pedido)
                .ThenInclude(p => p!.Ped_Mesa)
            .Include(c => c.Cmd_Pedido)
                .ThenInclude(p => p!.Ped_Usuario)
            .Where(c => c.Cmd_Estado == EstadoComanda.Lista && !c.Cmd_AvisoVisto && c.Cmd_Pedido != null && c.Cmd_Pedido.Ped_FechaOperativa == fechaOperativa);

        if (esCajero)
        {
            query = query.Where(c => c.Cmd_Pedido!.Ped_Tipo == TipoPedido.ParaLlevar);
            if (usuarioId.HasValue)
            {
                query = query.Where(c => c.Cmd_Pedido!.Id_Usuario == usuarioId.Value ||
                                         (c.Cmd_Pedido!.Ped_Usuario != null && c.Cmd_Pedido.Ped_Usuario.Usu_Rol == RolUsuario.Administrador));
            }
        }
        else
        {
            query = query.Where(c => c.Cmd_Pedido!.Ped_Tipo == TipoPedido.Mesa);
            if (usuarioId.HasValue)
            {
                query = query.Where(c => c.Cmd_Pedido!.Id_Usuario == usuarioId.Value ||
                                         (c.Cmd_Pedido!.Ped_Usuario != null && c.Cmd_Pedido.Ped_Usuario.Usu_Rol == RolUsuario.Administrador));
            }
        }

        return await query
            .OrderByDescending(c => c.Cmd_FechaHoraUtc)
            .ToListAsync(ct);
    }

    public async Task<Comanda?> ObtenerComandaPorIdAsync(Guid comandaId, CancellationToken ct = default)
    {
        return await _context.Comandas
            .Include(c => c.Cmd_Pedido)
            .Include(c => c.Cmd_Detalles)
            .FirstOrDefaultAsync(c => c.Id_Comanda == comandaId, ct);
    }

    public async Task ActualizarComandaAsync(Comanda comanda, CancellationToken ct = default)
    {
        _context.Comandas.Update(comanda);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> TieneOtrosPedidosAbiertosEnMesaAsync(Guid mesaId, Guid pedidoExcluidoId, CancellationToken ct = default)
    {
        return await _context.Pedidos.AnyAsync(p =>
            p.Id_Mesa == mesaId &&
            p.Id_Pedido != pedidoExcluidoId &&
            p.Ped_Estado != EstadoPedido.Pagado &&
            p.Ped_Estado != EstadoPedido.Anulado, ct);
    }

    public async Task<IReadOnlyList<Pedido>> ListarPedidosPendientesCobroAsync(DateOnly? fechaOperativa = null, CancellationToken ct = default)
    {
        var fecha = fechaOperativa ?? TimeZoneHelper.ObtenerFechaActualLima();
        return await _context.Pedidos
            .Include(p => p.Ped_Mesa)
            .Include(p => p.Ped_Usuario)
            .Include(p => p.Ped_Comandas)
            .Where(p => p.Ped_FechaOperativa == fecha && p.Ped_Estado != EstadoPedido.Pagado && p.Ped_Estado != EstadoPedido.Anulado)
            .OrderBy(p => p.Ped_Estado == EstadoPedido.Listo ? 0 : 1)
            .ThenBy(p => p.Ped_FechaHoraUtc)
            .ToListAsync(ct);
    }

    public async Task RegistrarAuditoriaAsync(AuditoriaPedido auditoria, CancellationToken ct = default)
    {
        await _context.AuditoriasPedido.AddAsync(auditoria, ct);
        await _context.SaveChangesAsync(ct);
    }
}
