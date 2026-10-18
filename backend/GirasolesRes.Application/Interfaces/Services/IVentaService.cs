using GirasolesRes.Application.DTOs.Ventas;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IVentaService
{
    Task<ListarVentasResponseDto> ListarVentasAsync(
        string? busqueda,
        string? desde,
        string? hasta,
        int pagina,
        int tamano,
        string usuarioRol,
        CancellationToken ct = default);

    Task<VentaDetalleDto> ObtenerDetalleVentaAsync(
        Guid ventaId,
        CancellationToken ct = default);

    Task<AnularVentaResponseDto> AnularVentaAsync(
        Guid ventaId,
        AnularVentaRequest request,
        string adminNombreUsuario,
        string usuarioRol,
        string? direccionIp = null,
        CancellationToken ct = default);
}
