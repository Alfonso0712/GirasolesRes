using GirasolesRes.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Resend;
using Xunit;

namespace GirasolesRes.Tests;

public class EmailServiceUnitTests
{
    private readonly Mock<IResend> _resendMock;
    private readonly Mock<ILogger<EmailService>> _loggerMock;
    private readonly IConfiguration _configuration;

    public EmailServiceUnitTests()
    {
        _resendMock = new Mock<IResend>();
        _loggerMock = new Mock<ILogger<EmailService>>();

        var configValues = new Dictionary<string, string?>
        {
            { "Resend:ApiKey", "re_test_key" },
            { "Resend:From", "Restaurante Girasoles <test@resend.dev>" },
            { "Resend:ToOverride", "" }
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_EnvioExitoso_RetornaTrue()
    {
        // ARRANGE
        var response = (ResendResponse<Guid>)System.Runtime.CompilerServices.RuntimeHelpers.GetUninitializedObject(typeof(ResendResponse<Guid>));

        _resendMock
            .Setup(r => r.EmailSendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        var service = new EmailService(_resendMock.Object, _configuration, _loggerMock.Object);

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", "123456");

        // ASSERT
        Assert.True(result);
        _resendMock.Verify(r => r.EmailSendAsync(
            It.Is<EmailMessage>(m => (m.Subject ?? "").Contains("Código de Recuperación") && (m.HtmlBody ?? "").Contains("123456")),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task EnviarCodigoRecuperacionAsync_FalloEnResend_RetornaFalseSinLanzarExcepcion()
    {
        // ARRANGE
        _resendMock
            .Setup(r => r.EmailSendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Resend API unreachable"));

        var service = new EmailService(_resendMock.Object, _configuration, _loggerMock.Object);

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

        var service = new EmailService(_resendMock.Object, emptyConfig, _loggerMock.Object);

        // ACT
        var result = await service.EnviarCodigoRecuperacionAsync("user@example.com", "123456");

        // ASSERT
        Assert.True(result);
        _resendMock.Verify(r => r.EmailSendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
