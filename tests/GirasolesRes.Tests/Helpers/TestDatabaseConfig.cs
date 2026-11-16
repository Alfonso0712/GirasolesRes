using Microsoft.Extensions.Configuration;

namespace GirasolesRes.Tests.Helpers;

internal static class TestDatabaseConfig
{
    public static string ObtenerConnectionStringPostgres()
    {
        var envConn = Environment.GetEnvironmentVariable("TEST_CONNECTION_STRING")
                      ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
        if (!string.IsNullOrWhiteSpace(envConn))
        {
            return envConn.Trim();
        }

        var builder = new ConfigurationBuilder()
            .AddUserSecrets("girasolesres-api-dev-secrets", reloadOnChange: false);

        var apiDevSettings = BuscarRutaAppSettingsDevelopment();
        if (apiDevSettings != null)
        {
            builder.AddJsonFile(apiDevSettings, optional: true, reloadOnChange: false);
        }

        var config = builder.Build();
        var conn = config.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(conn))
        {
            return conn.Trim();
        }

        throw new InvalidOperationException(
            "Falta configurar la variable de entorno 'TEST_CONNECTION_STRING' (o 'ConnectionStrings:DefaultConnection' en user-secrets) para ejecutar las pruebas de integración con PostgreSQL.");
    }

    private static string? BuscarRutaAppSettingsDevelopment()
    {
        var dir = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        while (dir != null)
        {
            var candidato = Path.Combine(dir.FullName, "backend", "GirasolesRes.API", "appsettings.Development.json");
            if (File.Exists(candidato))
            {
                return candidato;
            }
            dir = dir.Parent;
        }

        return null;
    }
}
