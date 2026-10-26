using GirasolesRes.Application.DTOs.Pedidos;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IPedidoConsultaService
{
    Task<PedidoResponseDto?> ObtenerPedidoPorIdAsync(Guid pedidoId, CancellationToken ct = default);

    Task<PedidoResponseDto?> ObtenerPedidoActivoPorMesaAsync(Guid mesaId, CancellationToken ct = default);

    Task<IReadOnlyList<PedidoAbiertoMesaDto>> ObtenerPedidosActivosPorMesaAsync(Guid mesaId, CancellationToken ct = default);

    Task<IReadOnlyList<ProductoMenuPedidoDto>> ObtenerMenuParaPedidoAsync(CancellationToken ct = default);

    Task<ListarPedidosResponseDto> ListarPedidosAsync(
        ListarPedidosQueryDto query,
        Guid usuarioId,
        string rol,
        CancellationToken ct = default);

    Task<DetallePedidoCompletoDto?> ObtenerDetalleCompletoAsync(Guid pedidoId, CancellationToken ct = default);
}
