using System.Net;
using System.Reflection;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.RateLimiting;
using GirasolesRes.API.Configuration;
using GirasolesRes.API.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;

namespace GirasolesRes.Tests;

public class RateLimitUnitTests
{
    [Fact]
    public void LeerConfiguracion_SinValores_UsaValoresPorDefectoEsperados()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var resultado = RateLimitHelper.LeerConfiguracion(config);

        Assert.Equal(10, resultado.AutenticacionPermitLimit);
        Assert.Equal(60, resultado.AutenticacionVentanaSegundos);
        Assert.Equal(300, resultado.GlobalPermitLimit);
        Assert.Equal(60, resultado.GlobalVentanaSegundos);
    }

    [Fact]
    public void LeerConfiguracion_ConSobrescrituras_AplicaValoresConfigurados()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["RateLimit:Autenticacion:PermitLimit"] = "5",
                ["RateLimit:Autenticacion:VentanaSegundos"] = "120",
                ["RateLimit:Global:PermitLimit"] = "500",
                ["RateLimit:Global:VentanaSegundos"] = "30"
            })
            .Build();

        var resultado = RateLimitHelper.LeerConfiguracion(config);

        Assert.Equal(5, resultado.AutenticacionPermitLimit);
        Assert.Equal(120, resultado.AutenticacionVentanaSegundos);
        Assert.Equal(500, resultado.GlobalPermitLimit);
        Assert.Equal(30, resultado.GlobalVentanaSegundos);
    }

    [Fact]
    public void ParticionPorIp_AislamientoEntreIpsYRechazoAlSuperarLimite()
    {
        var config = new RateLimitConfiguracion
        {
            AutenticacionPermitLimit = 10,
            AutenticacionVentanaSegundos = 60
        };

        using var limiter = PartitionedRateLimiter.Create<HttpContext, string>(
            ctx => RateLimitHelper.ConstruirParticionAutenticacion(ctx, config));

        var ctxIpA = new DefaultHttpContext();
        ctxIpA.Connection.RemoteIpAddress = IPAddress.Parse("198.51.100.10");

        var ctxIpB = new DefaultHttpContext();
        ctxIpB.Connection.RemoteIpAddress = IPAddress.Parse("198.51.100.20");

        for (var i = 0; i < 10; i++)
        {
            using var lease = limiter.AttemptAcquire(ctxIpA);
            Assert.True(lease.IsAcquired, $"Intento {i + 1} desde IP A debió permitirse.");
        }

        using var leaseBloqueado = limiter.AttemptAcquire(ctxIpA);
        Assert.False(leaseBloqueado.IsAcquired);

        using var leaseOtraIp = limiter.AttemptAcquire(ctxIpB);
        Assert.True(leaseOtraIp.IsAcquired);
    }

    [Fact]
    public void ParticionGlobal_UsuariosAutenticadosDistintosEnMismaIpTienenCubetasSeparadas()
    {
        var ctxUser1 = new DefaultHttpContext();
        ctxUser1.Connection.RemoteIpAddress = IPAddress.Parse("203.0.113.5");
        ctxUser1.User = new ClaimsPrincipal(new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, "user-1") },
            "Bearer"));

        var ctxUser2 = new DefaultHttpContext();
        ctxUser2.Connection.RemoteIpAddress = IPAddress.Parse("203.0.113.5");
        ctxUser2.User = new ClaimsPrincipal(new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, "user-2") },
            "Bearer"));

        var ctxAnon = new DefaultHttpContext();
        ctxAnon.Connection.RemoteIpAddress = IPAddress.Parse("::ffff:203.0.113.5");

        var clave1 = RateLimitHelper.ObtenerClaveParticionGlobal(ctxUser1);
        var clave2 = RateLimitHelper.ObtenerClaveParticionGlobal(ctxUser2);
        var claveAnon = RateLimitHelper.ObtenerClaveParticionGlobal(ctxAnon);

        Assert.Equal("usr:user-1", clave1);
        Assert.Equal("usr:user-2", clave2);
        Assert.Equal("ip:203.0.113.5", claveAnon);
    }

    [Fact]
    public async Task EscribirRespuestaRechazoAsync_Retorna429RetryAfterYCuerpoEstandar()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var lease = new FakeRetryAfterLease(TimeSpan.FromSeconds(42));
        var rejectedContext = new OnRejectedContext
        {
            HttpContext = context,
            Lease = lease
        };

        await RateLimitHelper.EscribirRespuestaRechazoAsync(rejectedContext, 60, CancellationToken.None);

        Assert.Equal(StatusCodes.Status429TooManyRequests, context.Response.StatusCode);
        Assert.Equal("42", context.Response.Headers.RetryAfter.ToString());

        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body);
        var body = await reader.ReadToEndAsync();
        using var doc = JsonDocument.Parse(body);

        Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal(RateLimitConfiguracion.MensajeDemasiadosIntentos, doc.RootElement.GetProperty("message").GetString());
    }

    [Theory]
    [InlineData(nameof(AuthController.Login))]
    [InlineData(nameof(AuthController.ForgotPassword))]
    [InlineData(nameof(AuthController.ResetPassword))]
    public void AuthController_EndpointsPublicosSensibles_TienenPoliticaAutenticacion(string nombreMetodo)
    {
        var metodo = typeof(AuthController).GetMethod(nombreMetodo);
        Assert.NotNull(metodo);

        var atributo = metodo!.GetCustomAttribute<EnableRateLimitingAttribute>();
        Assert.NotNull(atributo);
        Assert.Equal(RateLimitConfiguracion.PoliticaAutenticacion, atributo!.PolicyName);
    }

    private sealed class FakeRetryAfterLease : RateLimitLease
    {
        private readonly TimeSpan _retryAfter;

        public FakeRetryAfterLease(TimeSpan retryAfter) => _retryAfter = retryAfter;

        public override bool IsAcquired => false;

        public override IEnumerable<string> MetadataNames => new[] { MetadataName.RetryAfter.Name };

        public override bool TryGetMetadata(string metadataName, out object? metadata)
        {
            if (metadataName == MetadataName.RetryAfter.Name)
            {
                metadata = _retryAfter;
                return true;
            }

            metadata = null;
            return false;
        }
    }
}
