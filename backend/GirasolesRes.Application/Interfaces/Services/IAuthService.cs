using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Auth;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IAuthService
{
    Task<Result<LoginResponse>> IniciarSesionAsync(LoginRequest request, string? direccionIp = null, CancellationToken cancellationToken = default);
    Task<Result<string>> SolicitarRecuperacionPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task<Result<string>> RestablecerPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> LogoutAsync(string jti, string nombreUsuario, string motivo, DateTime fechaExpiracionUtc, string? direccionIp = null, CancellationToken cancellationToken = default);
    Task<Result<string>> RenovarTokenAsync(string nombreUsuario, CancellationToken cancellationToken = default);
}
