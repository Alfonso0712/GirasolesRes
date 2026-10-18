using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class ComandaRepository : IComandaRepository
{
    private readonly GirasolesDbContext _context;

    public ComandaRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<List<Comanda>> ListarComandasCocinaAsync(DateOnly fechaOperativa)
    {
        return await _context.Comandas
            .Include(c => c.Cmd_Detalles)
            .Include(c => c.Cmd_Pedido)
                .ThenInclude(p => p!.Ped_Usuario)
            .Include(c => c.Cmd_Pedido)
                .ThenInclude(p => p!.Ped_Mesa)
            .Where(c => c.Cmd_Pedido != null &&
                        c.Cmd_Pedido.Ped_FechaOperativa == fechaOperativa &&
                        (c.Cmd_Estado == EstadoComanda.Pendiente || c.Cmd_Estado == EstadoComanda.EnPreparacion))
            .OrderBy(c => c.Cmd_FechaHoraUtc)
            .ToListAsync();
    }

    public async Task<Comanda?> ObtenerComandaPorIdAsync(Guid idComanda)
    {
        return await _context.Comandas
            .Include(c => c.Cmd_Detalles)
            .Include(c => c.Cmd_Pedido)
                .ThenInclude(p => p!.Ped_Usuario)
            .Include(c => c.Cmd_Pedido)
                .ThenInclude(p => p!.Ped_Mesa)
            .Include(c => c.Cmd_Pedido)
                .ThenInclude(p => p!.Ped_Comandas)
            .FirstOrDefaultAsync(c => c.Id_Comanda == idComanda);
    }

    public async Task ActualizarComandaAsync(Comanda comanda)
    {
        _context.Comandas.Update(comanda);
        await _context.SaveChangesAsync();
    }

    public async Task GuardarAuditoriaAsync(AuditoriaPedido auditoria)
    {
        _context.AuditoriasPedido.Add(auditoria);
        await _context.SaveChangesAsync();
    }

    public async Task<Pedido?> ObtenerPedidoConComandasAsync(Guid idPedido)
    {
        return await _context.Pedidos
            .Include(p => p.Ped_Comandas)
            .FirstOrDefaultAsync(p => p.Id_Pedido == idPedido);
    }

    public async Task ActualizarEstadoPedidoAsync(Guid idPedido, EstadoPedido nuevoEstado)
    {
        var pedido = await _context.Pedidos
            .Include(p => p.Ped_Comandas)
            .FirstOrDefaultAsync(p => p.Id_Pedido == idPedido);

        if (pedido != null)
        {
            pedido.CambiarEstado(nuevoEstado);
            await _context.SaveChangesAsync();
        }
    }
}
