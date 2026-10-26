using GirasolesRes.Application.DTOs.Pedidos;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IPedidoComandoService
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
}
