using System.Globalization;
using GirasolesRes.Application.Interfaces.Persistence;

namespace GirasolesRes.API.Services;

/// <summary>
/// Servicio en segundo plano encargado de depurar periódicamente los tokens revocados ya expirados.
/// </summary>
public sealed class LimpiezaTokensRevocadosService : BackgroundService
{
    public const int PeriodicidadPorDefectoDias = 7;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LimpiezaTokensRevocadosService> _logger;
    private readonly int _periodicidadDias;

    public LimpiezaTokensRevocadosService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<LimpiezaTokensRevocadosService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _periodicidadDias = ResolverPeriodicidadDias(configuration);
    }

    public int PeriodicidadDias => _periodicidadDias;

    public static int ResolverPeriodicidadDias(IConfiguration configuration)
    {
        var valor = configuration["Seguridad:LimpiezaTokensDias"];
        if (!string.IsNullOrWhiteSpace(valor) &&
            int.TryParse(valor.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var dias) &&
            dias > 0)
        {
            return dias;
        }

        return PeriodicidadPorDefectoDias;
    }

    public async Task<int> EjecutarLimpiezaAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ITokenRevocadoRepository>();
        var eliminados = await repo.LimpiarExpiradosAsync(cancellationToken);

        _logger.LogInformation(
            "Limpieza programada de tokens revocados ejecutada. Registros eliminados: {CantidadEliminada}.",
            eliminados);

        return eliminados;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(_periodicidadDias));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await EjecutarLimpiezaAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la limpieza programada de tokens revocados.");
            }

            try
            {
                if (!await timer.WaitForNextTickAsync(stoppingToken))
                {
                    break;
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
