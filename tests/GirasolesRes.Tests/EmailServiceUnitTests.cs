using System.Net;
using System.Net.Http;
using GirasolesRes.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace GirasolesRes.Tests;

public class EmailServiceUnitTests
{
    private readonly Mock<ILogger<EmailService>> _loggerMock;
    private readonly IConfiguration _configuration;

    public EmailServiceUnitTests()
    {
        _loggerMock = new Mock<ILogger<EmailService>>();

        var configValues = new Dictionary<string, string?>
        {
            { "Mailjet:ApiKey", "test_api_key" },
            { "Mailjet:SecretKey", "test_secret_key" },
            { "Mailjet:FromEmail", "no-reply@girasolesres.pp.ua" },
            { "Mailjet:FromName", "Restaurante Girasoles" }
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_EnvioExitoso_RetornaTrue()
    {
        // ARRANGE
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
        var service = new EmailService(httpClient, _configuration, _loggerMock.Object);

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", "123456");

        // ASSERT
        Assert.True(result);
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_FalloEnApi_RetornaFalseSinLanzarExcepcion()
    {
        // ARRANGE
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
        var service = new EmailService(httpClient, _configuration, _loggerMock.Object);

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", "123456");

        // ASSERT
        Assert.False(result);
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_SinApiKey_RetornaTrueOmitiendoEnvio()
    {
        // ARRANGE
        var emptyConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var httpClient = new HttpClient(new Mock<HttpMessageHandler>().Object);
        var service = new EmailService(httpClient, emptyConfig, _loggerMock.Object);

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", "123456");

        // ASSERT
        Assert.True(result);
    }
}
