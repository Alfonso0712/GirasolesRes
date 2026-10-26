using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Perfil;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IPerfilService
{
    Task<Result<string>> CambiarContrasenaPropiaAsync(
        string nombreUsuario,
        CambiarContrasenaPropiaRequest request,
        string? currentJti = null,
        DateTime? currentExp = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<string> ObtenerTemaAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task ActualizarTemaAsync(Guid usuarioId, string tema, CancellationToken cancellationToken = default);
}
