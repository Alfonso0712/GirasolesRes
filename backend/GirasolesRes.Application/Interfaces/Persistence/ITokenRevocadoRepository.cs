namespace GirasolesRes.Application.Interfaces.Persistence;

public interface ITokenRevocadoRepository
{
    Task RevocarAsync(string jti, string nombreUsuario, DateTime fechaExpiracionUtc, string motivo, CancellationToken cancellationToken = default);
    Task<bool> EstaRevocadoAsync(string jti, CancellationToken cancellationToken = default);
    Task RevocarTokensDeUsuarioAsync(string nombreUsuario, string motivo, CancellationToken cancellationToken = default);
    Task LimpiarExpiradosAsync(CancellationToken cancellationToken = default);
}
