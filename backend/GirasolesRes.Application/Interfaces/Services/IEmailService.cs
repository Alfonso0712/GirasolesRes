namespace GirasolesRes.Application.Interfaces.Services;

public interface IEmailService
{
    Task<bool> EnviarCodigoRecuperacionAsync(string correo, string codigo, CancellationToken cancellationToken = default);
}
