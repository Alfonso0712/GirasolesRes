using GirasolesRes.API.Services;
using GirasolesRes.Application.Interfaces.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace GirasolesRes.Tests;

public class LimpiezaTokensRevocadosServiceUnitTests
{
    [Fact]
    public void ResolverPeriodicidadDias_SinValor_Usa7DiasPorDefecto()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var dias = LimpiezaTokensRevocadosService.ResolverPeriodicidadDias(config);

        Assert.Equal(7, dias);
    }

    [Theory]
    [InlineData("3", 3)]
    [InlineData("14", 14)]
    [InlineData("0", 7)]
    [InlineData("-2", 7)]
    [InlineData("invalido", 7)]
    public void ResolverPeriodicidadDias_ValidaEntradaYFallback(string valor, int esperado)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Seguridad:LimpiezaTokensDias"] = valor
            })
            .Build();

        var dias = LimpiezaTokensRevocadosService.ResolverPeriodicidadDias(config);

        Assert.Equal(esperado, dias);
    }

    [Fact]
    public async Task EjecutarLimpiezaAsync_CreaScopeResuelveRepositorioYRegistraSoloCantidadEliminada()
    {
        var fakeRepo = new FakeTokenRevocadoRepository(eliminadosSimulados: 12);
        var services = new ServiceCollection();
        services.AddScoped<ITokenRevocadoRepository>(_ => fakeRepo);
        using var provider = services.BuildServiceProvider();

        var scopeFactory = provider.GetRequiredService<IServiceScopeFactory>();
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();
        var logger = new FakeLogger();

        var servicio = new LimpiezaTokensRevocadosService(scopeFactory, config, logger);

        var eliminados = await servicio.EjecutarLimpiezaAsync(CancellationToken.None);

        Assert.Equal(12, eliminados);
        Assert.Equal(1, fakeRepo.VecesInvocado);
        Assert.Single(logger.Mensajes);
        Assert.Contains("12", logger.Mensajes[0], StringComparison.Ordinal);
    }

    private sealed class FakeTokenRevocadoRepository : ITokenRevocadoRepository
    {
        private readonly int _eliminados;

        public FakeTokenRevocadoRepository(int eliminadosSimulados)
        {
            _eliminados = eliminadosSimulados;
        }

        public int VecesInvocado { get; private set; }

        public Task RevocarAsync(string jti, string nombreUsuario, DateTime fechaExpiracionUtc, string motivo, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task<bool> EstaRevocadoAsync(string jti, CancellationToken cancellationToken = default)
            => Task.FromResult(false);

        public Task RevocarTokensDeUsuarioAsync(string nombreUsuario, string motivo, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task<int> LimpiarExpiradosAsync(CancellationToken cancellationToken = default)
        {
            VecesInvocado++;
            return Task.FromResult(_eliminados);
        }
    }

    private sealed class FakeLogger : ILogger<LimpiezaTokensRevocadosService>
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
