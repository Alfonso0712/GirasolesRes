using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Auth;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> IniciarSesionAsync(LoginRequest request, string? direccionIp = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<string>> SolicitarRecuperacionPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<string>> RestablecerPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> LogoutAsync(string jti, string nombreUsuario, string motivo, DateTime fechaExpiracionUtc, string? direccionIp = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<string>> RenovarTokenAsync(string nombreUsuario, CancellationToken cancellationToken = default);
}
