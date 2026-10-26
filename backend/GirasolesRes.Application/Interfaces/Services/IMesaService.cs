using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Mesas;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IMesaService
{
    Task<Result<List<MesaDto>>> ListarMesasAsync(
        string? estado,
        bool incluirInactivas,
        string rolUsuario,
        CancellationToken cancellationToken = default);

    Task<Result<MesaDto>> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result<MesaDto>> RegistrarMesaAsync(
        CrearMesaRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<MesaDto>> ActualizarMesaAsync(
        Guid id,
        ActualizarMesaRequest request,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<MesaDto>> CambiarEstadoAsync(
        Guid id,
        bool activa,
        string adminUsername,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<Result<ResumenMesasDto>> ObtenerResumenAsync(CancellationToken cancellationToken = default);
}
