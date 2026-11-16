using Microsoft.Extensions.Configuration;
using Npgsql;

namespace GirasolesRes.Tests.Helpers;

internal static class TestDatabaseConfig
{
    private static int _esquemaAsegurado;

    public static string ObtenerConnectionStringPostgres()
    {
        var conn = ResolverConnectionStringPostgres();
        AsegurarColumnasMigradasEnPruebas(conn);
        return conn;
    }

    private static string ResolverConnectionStringPostgres()
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

    private static void AsegurarColumnasMigradasEnPruebas(string connectionString)
    {
        if (Interlocked.Exchange(ref _esquemaAsegurado, 1) == 1)
        {
            return;
        }

        try
        {
            using var connection = new NpgsqlConnection(connectionString);
            connection.Open();
            using var cmd = connection.CreateCommand();
            cmd.CommandText = """
                ALTER TABLE IF EXISTS public.usuarios
                    ADD COLUMN IF NOT EXISTS pref_orientacion VARCHAR(10) NOT NULL DEFAULT 'right';
                """;
            cmd.ExecuteNonQuery();
        }
        catch
        {
            Interlocked.Exchange(ref _esquemaAsegurado, 0);
        }
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
