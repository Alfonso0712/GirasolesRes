using GirasolesRes.Application.DTOs.Pedidos;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IPedidoService
{
    Task<RegistrarPedidoResultDto> RegistrarPedidoMesaAsync(
        RegistrarPedidoMesaRequest request,
        string nombreUsuario,
        Guid usuarioId,
        string? direccionIp,
        CancellationToken ct = default);

    Task<RegistrarPedidoLlevarResultDto> RegistrarPedidoLlevarAsync(
        RegistrarPedidoLlevarRequest request,
        string nombreUsuario,
        Guid usuarioId,
        string? direccionIp,
        CancellationToken ct = default);

    Task<AgregarLineasResultDto> AgregarLineasAsync(
        Guid pedidoId,
        AgregarLineasPedidoRequest request,
        string nombreUsuario,
        Guid usuarioId,
        string? direccionIp,
        CancellationToken ct = default);

    Task<PedidoResponseDto?> ObtenerPedidoPorIdAsync(Guid pedidoId, CancellationToken ct = default);

    Task<PedidoResponseDto?> ObtenerPedidoActivoPorMesaAsync(Guid mesaId, CancellationToken ct = default);

    Task<IReadOnlyList<PedidoAbiertoMesaDto>> ObtenerPedidosActivosPorMesaAsync(Guid mesaId, CancellationToken ct = default);

    Task<IReadOnlyList<ProductoMenuPedidoDto>> ObtenerMenuParaPedidoAsync(CancellationToken ct = default);

    // CUS09: Gestión de Pedidos
    Task<ListarPedidosResponseDto> ListarPedidosAsync(
        ListarPedidosQueryDto query,
        Guid usuarioId,
        string rol,
        CancellationToken ct = default);

    Task<DetallePedidoCompletoDto?> ObtenerDetalleCompletoAsync(Guid pedidoId, CancellationToken ct = default);

    Task<decimal> ModificarPedidoAsync(
        Guid pedidoId,
        ModificarPedidoRequest request,
        Guid usuarioId,
        string rol,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default);

    Task AnularPedidoAsync(
        Guid pedidoId,
        AnularPedidoRequest request,
        Guid usuarioId,
        string rol,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default);

    Task<IReadOnlyList<AvisoComandaDto>> ObtenerAvisosPendientesAsync(
        Guid usuarioId,
        string rol,
        CancellationToken ct = default);

    Task MarcarAvisoVistoAsync(
        Guid comandaId,
        Guid usuarioId,
        string nombreUsuario,
        string? direccionIp,
        CancellationToken ct = default);
}
