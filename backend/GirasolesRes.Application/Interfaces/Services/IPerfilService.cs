using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Perfil;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IPerfilService
{
    Task<ApiResponse<string>> CambiarContrasenaPropiaAsync(
        string nombreUsuario,
        CambiarContrasenaPropiaRequest request,
        string? currentJti = null,
        DateTime? currentExp = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);
}
