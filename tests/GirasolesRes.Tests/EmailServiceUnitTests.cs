using System.Net;
using System.Text.Json;
using GirasolesRes.Infrastructure.Configuration;
using GirasolesRes.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace GirasolesRes.Tests;

public class EmailServiceUnitTests
{
    private readonly FakeLogger _fakeLogger;
    private readonly IConfiguration _configuration;

    public EmailServiceUnitTests()
    {
        _fakeLogger = new FakeLogger();

        var configValues = new Dictionary<string, string?>
        {
            { "Email:ApiKey", "test_api_key" },
            { "Email:SecretKey", "test_secret_key" },
            { "Email:FromEmail", "no-reply@girasolesres.pp.ua" },
            { "Email:FromName", "Restaurante Girasoles" }
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_EnvioExitoso_RetornaTrueYNuncaRegistraElCodigoEnLogs()
    {
        // ARRANGE
        const string codigoOtp = "849302";
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent("{\"Messages\":[{\"Status\":\"success\"}]}")
            });

        var httpClient = new HttpClient(handlerMock.Object);
        var service = new EmailService(httpClient, _configuration, _fakeLogger, new EntornoAplicacion(EsDesarrollo: false));

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("admin@girasoles.com", codigoOtp);

        // ASSERT
        Assert.True(result);
        Assert.NotEmpty(_fakeLogger.Mensajes);
        Assert.All(_fakeLogger.Mensajes, msg => Assert.DoesNotContain(codigoOtp, msg, StringComparison.Ordinal));
        Assert.All(_fakeLogger.Mensajes, msg => Assert.DoesNotContain("<!DOCTYPE html>", msg, StringComparison.Ordinal));
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_FalloEnApi_RetornaFalseSinLanzarExcepcionNiRegistrarCodigo()
    {
        // ARRANGE
        const string codigoOtp = "739104";
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.InternalServerError,
                Content = new StringContent("{\"ErrorMessage\":\"Internal Error\"}")
            });

        var httpClient = new HttpClient(handlerMock.Object);
        var service = new EmailService(httpClient, _configuration, _fakeLogger, new EntornoAplicacion(EsDesarrollo: false));

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", codigoOtp);

        // ASSERT
        Assert.False(result);
        Assert.NotEmpty(_fakeLogger.Mensajes);
        Assert.All(_fakeLogger.Mensajes, msg => Assert.DoesNotContain(codigoOtp, msg, StringComparison.Ordinal));
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_SinApiKeyEnDevelopment_SimulaSoloEnConsolaYNuncaEnILogger()
    {
        // ARRANGE
        const string codigoOtp = "551920";
        var emptyConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var httpClient = new HttpClient(new Mock<HttpMessageHandler>().Object);
        var service = new EmailService(httpClient, emptyConfig, _fakeLogger, new EntornoAplicacion(EsDesarrollo: true));

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", codigoOtp);

        // ASSERT
        Assert.True(result);
        Assert.NotEmpty(_fakeLogger.Mensajes);
        Assert.All(_fakeLogger.Mensajes, msg => Assert.DoesNotContain(codigoOtp, msg, StringComparison.Ordinal));
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_SinApiKeyEnProduction_RetornaFalseYNoSimula()
    {
        // ARRANGE
        const string codigoOtp = "664219";
        var emptyConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var httpClient = new HttpClient(new Mock<HttpMessageHandler>().Object);
        var service = new EmailService(httpClient, emptyConfig, _fakeLogger, new EntornoAplicacion(EsDesarrollo: false));

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", codigoOtp);

        // ASSERT
        Assert.False(result);
        Assert.NotEmpty(_fakeLogger.Mensajes);
        Assert.All(_fakeLogger.Mensajes, msg => Assert.DoesNotContain(codigoOtp, msg, StringComparison.Ordinal));
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_DestinatarioDePrueba_AplicaEnDevelopmentYSeIgnoraEnProduction()
    {
        // ARRANGE
        var destinatariosEnviados = new List<string>();
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .Callback<HttpRequestMessage, CancellationToken>((req, _) =>
            {
                var body = req.Content!.ReadAsStringAsync().GetAwaiter().GetResult();
                using var doc = JsonDocument.Parse(body);
                var toEmail = doc.RootElement.GetProperty("Messages")[0].GetProperty("To")[0].GetProperty("Email").GetString();
                if (toEmail != null) destinatariosEnviados.Add(toEmail);
            })
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent("{\"Messages\":[{\"Status\":\"success\"}]}")
            });

        var configConPrueba = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Email:ApiKey", "test_api_key" },
                { "Email:SecretKey", "test_secret_key" },
                { "Email:DestinatarioDePrueba", "qa-prueba@ejemplo.com" }
            })
            .Build();

        var httpClient = new HttpClient(handlerMock.Object);
        var serviceDev = new EmailService(httpClient, configConPrueba, _fakeLogger, new EntornoAplicacion(EsDesarrollo: true));
        var serviceProd = new EmailService(httpClient, configConPrueba, _fakeLogger, new EntornoAplicacion(EsDesarrollo: false));

        // ACT
        await serviceDev.EnviarCodigoRecuperacionAsync("admin@girasoles.com", "112233");
        await serviceProd.EnviarCodigoRecuperacionAsync("admin@girasoles.com", "445566");

        // ASSERT
        Assert.Equal(2, destinatariosEnviados.Count);
        Assert.Equal("qa-prueba@ejemplo.com", destinatariosEnviados[0]);
        Assert.Equal("admin@girasoles.com", destinatariosEnviados[1]);
        Assert.All(_fakeLogger.Mensajes, msg => Assert.DoesNotContain("112233", msg, StringComparison.Ordinal));
        Assert.All(_fakeLogger.Mensajes, msg => Assert.DoesNotContain("445566", msg, StringComparison.Ordinal));
    }

    private sealed class FakeLogger : ILogger<EmailService>
    {
        public List<string> Mensajes { get; } = new();

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            Mensajes.Add(formatter(state, exception));
        }
    }
}
