using GirasolesRes.API.Configuration;
using GirasolesRes.API.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;

namespace GirasolesRes.Tests;

public class SuperficieHttpUnitTests
{
    [Theory]
    [InlineData("http://localhost:5173", true)]
    [InlineData("https://localhost", true)]
    [InlineData("capacitor://localhost", true)]
    [InlineData("http://127.0.0.1:8080", true)]
    [InlineData("https://girasolesres.pp.ua", true)]
    [InlineData("https://app.girasolesres.pp.ua", true)]
    [InlineData("https://girasoles.astrazynk.pp.ua", true)]
    [InlineData("https://preview.girasoles.pages.dev", true)]
    [InlineData("null", false)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData(null, false)]
    [InlineData("https://evil.example.com", false)]
    public void EsOrigenCorsPermitido_ValidaListaBlancaYRechazaNulo(string? origen, bool esperado)
    {
        var resultado = SuperficieHttpHelper.EsOrigenCorsPermitido(origen);

        Assert.Equal(esperado, resultado);
    }

    [Theory]
    [InlineData(null, true, true)]
    [InlineData(null, false, false)]
    [InlineData("true", false, true)]
    [InlineData("false", true, false)]
    public void EsSwaggerHabilitado_RespetaEntornoYSobrescritura(string? valorConfig, bool esDesarrollo, bool esperado)
    {
        var dict = new Dictionary<string, string?>();
        if (valorConfig != null)
        {
            dict["Swagger:Habilitado"] = valorConfig;
        }

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(dict)
            .Build();

        var resultado = SuperficieHttpHelper.EsSwaggerHabilitado(config, esDesarrollo);

        Assert.Equal(esperado, resultado);
    }

    [Fact]
    public async Task SecurityHeadersMiddleware_AplicaEncabezadosDefensivosYNoStoreEnAuth()
    {
        var onStartingCallbacks = new List<Func<Task>>();
        var responseFeature = new TestHttpResponseFeature(onStartingCallbacks);
        var context = new DefaultHttpContext();
        context.Features.Set<IHttpResponseFeature>(responseFeature);
        context.Request.Path = "/api/auth/login";

        var middleware = new SecurityHeadersMiddleware(_ => Task.CompletedTask);

        await middleware.InvokeAsync(context);
        foreach (var cb in onStartingCallbacks)
        {
            await cb();
        }

        Assert.Equal("nosniff", context.Response.Headers["X-Content-Type-Options"].ToString());
        Assert.Equal("DENY", context.Response.Headers["X-Frame-Options"].ToString());
        Assert.Equal("no-referrer", context.Response.Headers["Referrer-Policy"].ToString());
        Assert.Contains("camera=()", context.Response.Headers["Permissions-Policy"].ToString(), StringComparison.Ordinal);
        Assert.Equal("no-store", context.Response.Headers["Cache-Control"].ToString());
        Assert.False(context.Response.Headers.ContainsKey("Content-Security-Policy"));
    }

    private sealed class TestHttpResponseFeature : HttpResponseFeature
    {
        private readonly List<Func<Task>> _callbacks;

        public TestHttpResponseFeature(List<Func<Task>> callbacks)
        {
            _callbacks = callbacks;
        }

        public override void OnStarting(Func<object, Task> callback, object state)
        {
            _callbacks.Add(() => callback(state));
        }
    }
}
