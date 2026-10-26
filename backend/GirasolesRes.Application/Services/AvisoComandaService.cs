using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Services;

public class AvisoComandaService : IAvisoComandaService
{
    private readonly IPedidoRepository _pedidoRepository;

    public AvisoComandaService(IPedidoRepository pedidoRepository)
    {
        _pedidoRepository = pedidoRepository;
    }

    public async Task<IReadOnlyList<AvisoComandaDto>> ObtenerAvisosPendientesAsync(
        Guid usuarioId,
        string rol,
        CancellationToken ct = default)
    {
        var esCajero = string.Equals(rol, "Cajero", StringComparison.OrdinalIgnoreCase);
        var fechaOperativa = TimeZoneHelper.ObtenerFechaActualLima();
        var comandas = await _pedidoRepository.ObtenerAvisosPendientesAsync(fechaOperativa, usuarioId, esCajero, ct);

        return comandas.Select(c => new AvisoComandaDto(
            c.Id_Comanda,
            c.Id_Pedido,
            c.Cmd_Pedido?.Ped_NumeroDiario ?? c.Cmd_NumeroDiario,
            c.Cmd_Pedido?.Ped_Tipo.ToString() ?? "Mesa",
            c.Cmd_Pedido?.Ped_Mesa?.Mes_Nombre ?? c.Cmd_NombreMesa,
            c.Cmd_Pedido?.Ped_Notas,
            c.Cmd_FechaHoraUtc.AddHours(-5).ToString("HH:mm")
        )).ToList();
    }

    public async Task MarcarAvisoVistoAsync(
        Guid comandaId,
        Guid usuarioId,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default)
    {
        var comanda = await _pedidoRepository.ObtenerComandaPorIdAsync(comandaId, ct);
        if (comanda == null)
        {
            throw new RecursoNoEncontradoException("Comanda no encontrada.");
        }

        comanda.MarcarAvisoVisto(nombreUsuario);
        await _pedidoRepository.ActualizarComandaAsync(comanda, ct);

        var auditoria = new AuditoriaPedido(
            nombreUsuario,
            "Aviso de comanda visto",
            comanda.Cmd_NombreMesa,
            comanda.Cmd_Pedido?.Ped_NumeroDiario ?? comanda.Cmd_NumeroDiario,
            $"Aviso de comanda lista visto y cerrado por {nombreUsuario}.",
            direccionIp
        );
        await _pedidoRepository.RegistrarAuditoriaAsync(auditoria, ct);
    }
}
