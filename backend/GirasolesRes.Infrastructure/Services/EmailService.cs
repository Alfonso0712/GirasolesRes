using GirasolesRes.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace GirasolesRes.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task<bool> EnviarCodigoRecuperacionAsync(string correo, string codigo, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("==================================================");
        _logger.LogInformation(" [SISTEMA GIRASOLES] Correo de Recuperación");
        _logger.LogInformation(" Destinatario: {Correo}", correo);
        _logger.LogInformation(" Código de recuperación (6 dígitos): {Codigo}", codigo);
        _logger.LogInformation(" Válido por 15 minutos (un solo uso)");
        _logger.LogInformation("==================================================");

        return Task.FromResult(true);
    }
}
