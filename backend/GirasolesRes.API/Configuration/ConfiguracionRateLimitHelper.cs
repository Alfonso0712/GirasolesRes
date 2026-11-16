using System.Globalization;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace GirasolesRes.API.Configuration;

/// <summary>
/// Configuración y utilidades puras para limitación de tasa (HTTP 429) usando la IP resuelta por ForwardedHeaders.
/// </summary>
public sealed class RateLimitConfiguracion
{
    public const string PoliticaAutenticacion = "autenticacion";
    public const string MensajeDemasiadosIntentos = "Demasiados intentos. Intente nuevamente en unos minutos.";

    public int AutenticacionPermitLimit { get; init; } = 10;
    public int AutenticacionVentanaSegundos { get; init; } = 60;
    public int GlobalPermitLimit { get; init; } = 300;
    public int GlobalVentanaSegundos { get; init; } = 60;
}

public static class RateLimitHelper
{
    public static RateLimitConfiguracion LeerConfiguracion(IConfiguration configuration)
    {
        return new RateLimitConfiguracion
        {
            AutenticacionPermitLimit = LeerEnteroPositivo(configuration["RateLimit:Autenticacion:PermitLimit"], 10),
            AutenticacionVentanaSegundos = LeerEnteroPositivo(configuration["RateLimit:Autenticacion:VentanaSegundos"], 60),
            GlobalPermitLimit = LeerEnteroPositivo(configuration["RateLimit:Global:PermitLimit"], 300),
            GlobalVentanaSegundos = LeerEnteroPositivo(configuration["RateLimit:Global:VentanaSegundos"], 60)
        };
    }

    public static string ObtenerIpCliente(HttpContext context)
    {
        var ip = context.Connection.RemoteIpAddress;
        if (ip == null)
        {
            return "ip-desconocida";
        }

        if (ip.IsIPv4MappedToIPv6)
        {
            ip = ip.MapToIPv4();
        }

        return ip.ToString();
    }

    public static string ObtenerClaveParticionAutenticacion(HttpContext context)
    {
        return $"auth:{ObtenerIpCliente(context)}";
    }

    public static string ObtenerClaveParticionGlobal(HttpContext context)
    {
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? context.User.FindFirstValue(ClaimTypes.Name)
                         ?? context.User.Identity.Name;

            if (!string.IsNullOrWhiteSpace(userId))
            {
                return $"usr:{userId.Trim().ToLowerInvariant()}";
            }
        }

        return $"ip:{ObtenerIpCliente(context)}";
    }

    public static RateLimitPartition<string> ConstruirParticionAutenticacion(
        HttpContext context,
        RateLimitConfiguracion config)
    {
        var clave = ObtenerClaveParticionAutenticacion(context);
        return RateLimitPartition.GetFixedWindowLimiter(clave, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = config.AutenticacionPermitLimit,
            Window = TimeSpan.FromSeconds(config.AutenticacionVentanaSegundos),
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            AutoReplenishment = true
        });
    }

    public static RateLimitPartition<string> ConstruirParticionGlobal(
        HttpContext context,
        RateLimitConfiguracion config)
    {
        var clave = ObtenerClaveParticionGlobal(context);
        return RateLimitPartition.GetFixedWindowLimiter(clave, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = config.GlobalPermitLimit,
            Window = TimeSpan.FromSeconds(config.GlobalVentanaSegundos),
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            AutoReplenishment = true
        });
    }

    public static async ValueTask EscribirRespuestaRechazoAsync(
        OnRejectedContext rejectedContext,
        int ventanaPorDefectoSegundos,
        CancellationToken cancellationToken)
    {
        var httpContext = rejectedContext.HttpContext;
        httpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        httpContext.Response.ContentType = "application/json; charset=utf-8";

        var retryAfterSegundos = ventanaPorDefectoSegundos > 0 ? ventanaPorDefectoSegundos : 60;
        if (rejectedContext.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            var calculado = (int)Math.Ceiling(retryAfter.TotalSeconds);
            retryAfterSegundos = Math.Max(1, calculado);
        }

        httpContext.Response.Headers.RetryAfter = retryAfterSegundos.ToString(CultureInfo.InvariantCulture);

        var cuerpo = JsonSerializer.Serialize(new
        {
            success = false,
            message = RateLimitConfiguracion.MensajeDemasiadosIntentos
        });

        await httpContext.Response.WriteAsync(cuerpo, cancellationToken);
    }

    private static int LeerEnteroPositivo(string? valorConfig, int valorPorDefecto)
    {
        if (!string.IsNullOrWhiteSpace(valorConfig) &&
            int.TryParse(valorConfig.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var numero) &&
            numero > 0)
        {
            return numero;
        }

        return valorPorDefecto;
    }
}
