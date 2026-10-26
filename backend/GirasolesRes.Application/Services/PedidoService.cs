using GirasolesRes.Application.DTOs.Pedidos;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;

namespace GirasolesRes.Application.Services;

/// <summary>
/// Fachada unificada del servicio de pedidos que compone y delega en los servicios especializados
/// (PedidoComandoService, PedidoConsultaService, AvisoComandaService) preservando retrocompatibilidad total.
/// </summary>
public class PedidoService : IPedidoService
{
    private readonly IPedidoComandoService _comandoService;
    private readonly IPedidoConsultaService _consultaService;
    private readonly IAvisoComandaService _avisoService;

    public PedidoService(
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        IProductoRepository productoRepository,
        IMenuDiaRepository menuDiaRepository,
        IMenuCompletoRepository? menuCompletoRepository = null)
        : this(
            new PedidoComandoService(pedidoRepository, mesaRepository, productoRepository, menuDiaRepository, menuCompletoRepository),
            new PedidoConsultaService(pedidoRepository, productoRepository, menuDiaRepository),
            new AvisoComandaService(pedidoRepository))
    {
    }

    public PedidoService(
        IPedidoComandoService comandoService,
        IPedidoConsultaService consultaService,
        IAvisoComandaService avisoService)
    {
        _comandoService = comandoService;
        _consultaService = consultaService;
        _avisoService = avisoService;
    }

    // Comandos
    public Task<RegistrarPedidoResultDto> RegistrarPedidoMesaAsync(
        RegistrarPedidoMesaRequest request, string nombreUsuario, Guid usuarioId, string? direccionIp, CancellationToken ct = default) =>
        _comandoService.RegistrarPedidoMesaAsync(request, nombreUsuario, usuarioId, direccionIp, ct);

    public Task<RegistrarPedidoLlevarResultDto> RegistrarPedidoLlevarAsync(
        RegistrarPedidoLlevarRequest request, string nombreUsuario, Guid usuarioId, string? direccionIp, CancellationToken ct = default) =>
        _comandoService.RegistrarPedidoLlevarAsync(request, nombreUsuario, usuarioId, direccionIp, ct);

    public Task<AgregarLineasResultDto> AgregarLineasAsync(
        Guid pedidoId, AgregarLineasPedidoRequest request, string nombreUsuario, Guid usuarioId, string? direccionIp, CancellationToken ct = default) =>
        _comandoService.AgregarLineasAsync(pedidoId, request, nombreUsuario, usuarioId, direccionIp, ct);

    public Task<decimal> ModificarPedidoAsync(
        Guid pedidoId, ModificarPedidoRequest request, Guid usuarioId, string rol, string nombreUsuario, string? direccionIp, CancellationToken ct = default) =>
        _comandoService.ModificarPedidoAsync(pedidoId, request, usuarioId, rol, nombreUsuario, direccionIp, ct);

    public Task AnularPedidoAsync(
        Guid pedidoId, AnularPedidoRequest request, Guid usuarioId, string rol, string nombreUsuario, string? direccionIp, CancellationToken ct = default) =>
        _comandoService.AnularPedidoAsync(pedidoId, request, usuarioId, rol, nombreUsuario, direccionIp, ct);

    // Consultas
    public Task<PedidoResponseDto?> ObtenerPedidoPorIdAsync(Guid pedidoId, CancellationToken ct = default) =>
        _consultaService.ObtenerPedidoPorIdAsync(pedidoId, ct);

    public Task<PedidoResponseDto?> ObtenerPedidoActivoPorMesaAsync(Guid mesaId, CancellationToken ct = default) =>
        _consultaService.ObtenerPedidoActivoPorMesaAsync(mesaId, ct);

    public Task<IReadOnlyList<PedidoAbiertoMesaDto>> ObtenerPedidosActivosPorMesaAsync(Guid mesaId, CancellationToken ct = default) =>
        _consultaService.ObtenerPedidosActivosPorMesaAsync(mesaId, ct);

    public Task<IReadOnlyList<ProductoMenuPedidoDto>> ObtenerMenuParaPedidoAsync(CancellationToken ct = default) =>
        _consultaService.ObtenerMenuParaPedidoAsync(ct);

    public Task<ListarPedidosResponseDto> ListarPedidosAsync(
        ListarPedidosQueryDto query, Guid usuarioId, string rol, CancellationToken ct = default) =>
        _consultaService.ListarPedidosAsync(query, usuarioId, rol, ct);

    public Task<DetallePedidoCompletoDto?> ObtenerDetalleCompletoAsync(Guid pedidoId, CancellationToken ct = default) =>
        _consultaService.ObtenerDetalleCompletoAsync(pedidoId, ct);

    // Avisos
    public Task<IReadOnlyList<AvisoComandaDto>> ObtenerAvisosPendientesAsync(Guid usuarioId, string rol, CancellationToken ct = default) =>
        _avisoService.ObtenerAvisosPendientesAsync(usuarioId, rol, ct);

    public Task MarcarAvisoVistoAsync(Guid comandaId, Guid usuarioId, string nombreUsuario, string? direccionIp, CancellationToken ct = default) =>
        _avisoService.MarcarAvisoVistoAsync(comandaId, usuarioId, nombreUsuario, direccionIp, ct);
}
