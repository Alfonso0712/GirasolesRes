using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Mesas;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IMesaService
{
    Task<ApiResponse<List<MesaDto>>> ListarMesasAsync(
        string? estado,
        bool incluirInactivas,
        string rolUsuario,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<MesaDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ApiResponse<MesaDto>> RegistrarMesaAsync(
        CrearMesaRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<MesaDto>> ActualizarMesaAsync(
        Guid id,
        ActualizarMesaRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<MesaDto>> CambiarEstadoAsync(
        Guid id,
        bool activa,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<ResumenMesasDto>> ObtenerResumenAsync(CancellationToken cancellationToken = default);
}
