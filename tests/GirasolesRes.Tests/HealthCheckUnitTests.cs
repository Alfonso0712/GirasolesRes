using System.Text.Json;
using GirasolesRes.API.Health;
using GirasolesRes.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace GirasolesRes.Tests;

public class HealthCheckUnitTests
{
    [Fact]
    public async Task BaseDatosHealthCheck_CuandoDbDisponible_RetornaHealthySinDetalles()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var context = new GirasolesDbContext(options);
        var check = new BaseDatosHealthCheck(context);

        var resultado = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Healthy, resultado.Status);
        Assert.Null(resultado.Exception);
        Assert.True(string.IsNullOrEmpty(resultado.Description));
    }

    [Fact]
    public async Task BaseDatosHealthCheck_CuandoContextoFalla_RetornaUnhealthySinExponerExcepcion()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new GirasolesDbContext(options);
        await context.DisposeAsync();
        var check = new BaseDatosHealthCheck(context);

        var resultado = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Unhealthy, resultado.Status);
        Assert.Null(resultado.Exception);
        Assert.True(string.IsNullOrEmpty(resultado.Description));
    }

    [Fact]
    public async Task HealthResponseWriter_Healthy_Retorna200YJsonMinimo()
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();
        var report = new HealthReport(
            new Dictionary<string, HealthReportEntry>
            {
                ["postgresql"] = new(HealthStatus.Healthy, "ok", TimeSpan.FromMilliseconds(5), null, null)
            },
            TimeSpan.FromMilliseconds(5));

        await HealthResponseWriter.EscribirRespuestaAsync(httpContext, report);

        Assert.Equal(StatusCodes.Status200OK, httpContext.Response.StatusCode);
        httpContext.Response.Body.Position = 0;
        using var doc = await JsonDocument.ParseAsync(httpContext.Response.Body);
        Assert.Equal("Healthy", doc.RootElement.GetProperty("status").GetString());
        Assert.Single(doc.RootElement.EnumerateObject());
    }

    [Fact]
    public async Task HealthResponseWriter_Unhealthy_Retorna503YNoFiltraDetallesInternos()
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();
        var report = new HealthReport(
            new Dictionary<string, HealthReportEntry>
            {
                ["postgresql"] = new(
                    HealthStatus.Unhealthy,
                    "Error interno con Password=secreto",
                    TimeSpan.FromMilliseconds(5),
                    new InvalidOperationException("Host=interno"),
                    null)
            },
            TimeSpan.FromMilliseconds(5));

        await HealthResponseWriter.EscribirRespuestaAsync(httpContext, report);

        Assert.Equal(StatusCodes.Status503ServiceUnavailable, httpContext.Response.StatusCode);
        httpContext.Response.Body.Position = 0;
        using var reader = new StreamReader(httpContext.Response.Body);
        var json = await reader.ReadToEndAsync();

        Assert.DoesNotContain("Password", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Host=interno", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("postgresql", json, StringComparison.OrdinalIgnoreCase);

        using var doc = JsonDocument.Parse(json);
        Assert.Equal("Unhealthy", doc.RootElement.GetProperty("status").GetString());
        Assert.Single(doc.RootElement.EnumerateObject());
    }
}
