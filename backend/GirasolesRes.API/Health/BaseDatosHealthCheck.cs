using System.Text.Json;
using GirasolesRes.Infrastructure.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace GirasolesRes.API.Health;

/// <summary>
/// Verifica la disponibilidad básica de la base de datos mediante CanConnectAsync
/// sin incluir detalles internos ni mensajes de excepción en el resultado.
/// </summary>
public sealed class BaseDatosHealthCheck : IHealthCheck
{
    private readonly GirasolesDbContext _context;

    public BaseDatosHealthCheck(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var conectado = await _context.Database.CanConnectAsync(cancellationToken);
            return conectado
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy();
        }
        catch
        {
            return HealthCheckResult.Unhealthy();
        }
    }
}

public static class HealthResponseWriter
{
    public static async Task EscribirRespuestaAsync(HttpContext httpContext, HealthReport report)
    {
        var estaSaludable = report.Status == HealthStatus.Healthy;
        httpContext.Response.StatusCode = estaSaludable
            ? StatusCodes.Status200OK
            : StatusCodes.Status503ServiceUnavailable;
        httpContext.Response.ContentType = "application/json; charset=utf-8";

        var payload = JsonSerializer.Serialize(new
        {
            status = estaSaludable ? "Healthy" : "Unhealthy"
        });

        await httpContext.Response.WriteAsync(payload, httpContext.RequestAborted);
    }
}
