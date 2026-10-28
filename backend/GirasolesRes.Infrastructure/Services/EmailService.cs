using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GirasolesRes.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<EmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> EnviarCodigoRecuperacionAsync(string correo, string codigo, CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Mailjet:ApiKey"] ?? _configuration["Resend:ApiKey"];
        var secretKey = _configuration["Mailjet:SecretKey"];
        var fromEmail = _configuration["Mailjet:FromEmail"] ?? "no-reply@girasolesres.pp.ua";
        var fromName = _configuration["Mailjet:FromName"] ?? "Restaurante Girasoles";

        var destinatarioReal = correo.EndsWith("@girasoles.com", StringComparison.OrdinalIgnoreCase)
            ? "cjazztin7@gmail.com"
            : correo;

        _logger.LogInformation("==================================================");
        _logger.LogInformation(" [SISTEMA GIRASOLES] Código de Recuperación: {Codigo}", codigo);
        _logger.LogInformation(" Correo Solicitado: {Correo}", correo);
        _logger.LogInformation(" Destinatario Mailjet: {DestinatarioReal}", destinatarioReal);
        _logger.LogInformation(" Remitente: {FromName} <{FromEmail}>", fromName, fromEmail);
        _logger.LogInformation("==================================================");

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(secretKey))
        {
            _logger.LogWarning("No se encontraron 'Mailjet:ApiKey' o 'Mailjet:SecretKey' configuradas. Omitiendo despacho HTTP.");
            return true;
        }

        try
        {
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDFBF7; margin: 0; padding: 24px; color: #2C1A0E; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #F0E6D8; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }}
        .header {{ background: #C74E00; padding: 32px 24px; text-align: center; color: #FFFFFF; }}
        .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }}
        .header p {{ margin: 6px 0 0; font-size: 13px; opacity: 0.9; }}
        .content {{ padding: 32px 28px; text-align: center; }}
        .code-box {{ background: #FFF7ED; border: 2px dashed #EA580C; border-radius: 14px; padding: 20px; margin: 24px 0; }}
        .code {{ font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #C2410C; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }}
        .instructions {{ font-size: 14px; line-height: 1.6; color: #7C6F66; margin-bottom: 20px; }}
        .warning {{ font-size: 12px; color: #A89F91; line-height: 1.5; }}
        .footer {{ background: #FDFBF7; padding: 18px; text-align: center; font-size: 11px; color: #A89F91; border-top: 1px solid #F0E6D8; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Restaurante Girasoles</h1>
            <p>Recuperación de Contraseña</p>
        </div>
        <div class=""content"">
            <p class=""instructions"">Has solicitado restablecer tu contraseña en el Sistema de Gestión del <strong>Restaurante Girasoles</strong>. Tu código de verificación es:</p>
            <div class=""code-box"">
                <div class=""code"">{codigo}</div>
            </div>
            <p class=""instructions"">Este código de 6 dígitos es de <strong>un solo uso</strong> y vence en <strong>15 minutos</strong>.</p>
            <p class=""warning"">Si no solicitaste este cambio, puedes ignorar este mensaje con seguridad. Tu cuenta permanece protegida.</p>
        </div>
        <div class=""footer"">
            &copy; 2026 Restaurante Girasoles. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>";

            var payload = new
            {
                Messages = new[]
                {
                    new
                    {
                        From = new { Email = fromEmail, Name = fromName },
                        To = new[] { new { Email = destinatarioReal, Name = "Usuario" } },
                        Subject = "Código de Recuperación - Restaurante Girasoles",
                        HTMLPart = htmlBody
                    }
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var authHeader = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{apiKey}:{secretKey}"));

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.mailjet.com/v3.1/send")
            {
                Content = jsonContent
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

            var response = await _httpClient.SendAsync(request, cancellationToken);
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Correo de recuperación despachado con éxito vía Mailjet API a {DestinatarioReal}. Respuesta: {Respuesta}", destinatarioReal, responseBody);
                return true;
            }

            _logger.LogError("Fallo al enviar correo vía Mailjet API a {DestinatarioReal}. Código HTTP {StatusCode}. Respuesta: {Respuesta}", destinatarioReal, response.StatusCode, responseBody);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Excepción no controlada al enviar correo vía Mailjet API a {DestinatarioReal}", destinatarioReal);
            return false;
        }
    }
}
