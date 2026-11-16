using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace GirasolesRes.Infrastructure.Configuration;

/// <summary>
/// Valida al arranque del servidor que las credenciales y secretos críticos estén configurados,
/// cumplan la entropía mínima y no coincidan con marcadores ni valores débiles conocidos.
/// Nunca incluye el valor del secreto en mensajes de error ni advertencias.
/// </summary>
public sealed class ConfiguracionSeguridadValidator : IValidateOptions<ConfiguracionSeguridadOpciones>
{
    public const int LongitudMinimaClaveJwt = 32;
    public const int ExpiracionJwtPorDefectoMinutos = 30;
    public const int ExpiracionJwtMaximaMinutos = 1440;
    public const int LongitudMinimaPasswordSeed = 8;

    private static readonly HashSet<string> HashesSha256ClavesComprometidas = new(StringComparer.OrdinalIgnoreCase)
    {
        // Huella SHA-256 de la clave de demostración histórica retirada del código fuente
        "a44307daa3e1556fed79ea31e538d8c998b9cd26c02c49383ccb05fee17bcf6a"
    };

    private static readonly HashSet<string> ClavesDebilesConocidas = new(StringComparer.OrdinalIgnoreCase)
    {
        "secret",
        "secretkey",
        "changeme",
        "cambiar_este_secreto",
        "cambia_esta_clave_jwt_en_produccion",
        "password",
        "supersecretkeythatisatleast32chars",
        "your-256-bit-secret-key-goes-here",
        "12345678901234567890123456789012",
        "abcdefghijklmnopqrstuvwxyz123456",
        "00000000000000000000000000000000"
    };

    public ValidateOptionsResult Validate(string? name, ConfiguracionSeguridadOpciones options)
    {
        ArgumentNullException.ThrowIfNull(options);

        var errores = new List<string>();
        ValidarCadenaConexion(options.ConnectionString, errores);
        ValidarClaveJwt(options.Jwt.SecretKey, errores);

        var expStr = options.Jwt.ExpiracionMinutos?.ToString()
                     ?? options.Jwt.ExpiryMinutes?.ToString();
        ResolverExpiracionJwt(expStr, null, errores);

        var seedHabilitado = options.Seed.Habilitado ?? options.EsDesarrollo;
        if (seedHabilitado)
        {
            ValidarPasswordSeed(options.Seed.PasswordInicial, errores);
        }

        if (EsMarcadorDePosicion(options.ApisPeru.Token))
        {
            errores.Add("El valor de 'ApisPeru:Token' sigue siendo un marcador de plantilla. Configure el token real o déjelo vacío si no utiliza la consulta externa.");
        }

        if (EsMarcadorDePosicion(options.Email.ApiKey) || EsMarcadorDePosicion(options.Email.SecretKey))
        {
            errores.Add("Las credenciales de 'Email' ('ApiKey'/'SecretKey') siguen siendo marcadores de plantilla.");
        }

        return errores.Count > 0
            ? ValidateOptionsResult.Fail(errores)
            : ValidateOptionsResult.Success;
    }

    public static ResultadoValidacionConfiguracion Validar(IConfiguration configuration, bool esDesarrollo)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var errores = new List<string>();
        var advertencias = new List<string>();

        var connectionString = (configuration.GetConnectionString("DefaultConnection") ?? string.Empty).Trim();
        ValidarCadenaConexion(connectionString, errores);

        var jwtSecretKey = (configuration["Jwt:SecretKey"] ?? string.Empty).Trim();
        ValidarClaveJwt(jwtSecretKey, errores);

        var issuer = string.IsNullOrWhiteSpace(configuration["Jwt:Issuer"])
            ? "GirasolesRes"
            : configuration["Jwt:Issuer"]!.Trim();
        var audience = string.IsNullOrWhiteSpace(configuration["Jwt:Audience"])
            ? "GirasolesResApp"
            : configuration["Jwt:Audience"]!.Trim();

        var expiracionMinutos = ResolverExpiracionJwt(
            configuration["Jwt:ExpiracionMinutos"],
            configuration["Jwt:ExpiryMinutes"],
            errores);

        var seedHabilitado = ResolverSeedHabilitado(configuration["Seed:Habilitado"], esDesarrollo, errores);
        var seedPassword = configuration["Seed:PasswordInicial"];

        if (seedHabilitado)
        {
            ValidarPasswordSeed(seedPassword, errores);
        }

        var apisPeruToken = configuration["ApisPeru:Token"];
        if (EsMarcadorDePosicion(apisPeruToken))
        {
            errores.Add("El valor de 'ApisPeru:Token' es un marcador de plantilla. Defina el token real o déjelo vacío.");
        }
        else if (string.IsNullOrWhiteSpace(apisPeruToken))
        {
            advertencias.Add("La clave 'ApisPeru:Token' no está configurada; las consultas DNI/RUC devolverán servicio no disponible.");
        }

        var emailApiKey = configuration["Email:ApiKey"];
        if (string.IsNullOrWhiteSpace(emailApiKey))
        {
            emailApiKey = configuration["Mailjet:ApiKey"];
        }

        var emailSecretKey = configuration["Email:SecretKey"];
        if (string.IsNullOrWhiteSpace(emailSecretKey))
        {
            emailSecretKey = configuration["Mailjet:SecretKey"];
        }

        if (EsMarcadorDePosicion(emailApiKey) || EsMarcadorDePosicion(emailSecretKey))
        {
            errores.Add("Las credenciales de correo ('Email:ApiKey' / 'Email:SecretKey') contienen marcadores de plantilla.");
        }
        else if (string.IsNullOrWhiteSpace(emailApiKey) || string.IsNullOrWhiteSpace(emailSecretKey))
        {
            advertencias.Add(esDesarrollo
                ? "Las credenciales de correo ('Email:ApiKey' y 'Email:SecretKey') no están configuradas; se utilizará simulación local en consola."
                : "Las credenciales de correo ('Email:ApiKey' y 'Email:SecretKey') no están configuradas; la recuperación de contraseña por correo no podrá enviarse en producción.");
        }

        return new ResultadoValidacionConfiguracion(
            EsValido: errores.Count == 0,
            Errores: errores,
            Advertencias: advertencias,
            ConnectionString: connectionString,
            JwtSecretKey: jwtSecretKey,
            JwtIssuer: issuer,
            JwtAudience: audience,
            JwtExpiracionMinutos: expiracionMinutos,
            SeedHabilitado: seedHabilitado,
            SeedPasswordInicial: seedHabilitado ? seedPassword : null);
    }

    public static ResultadoValidacionConfiguracion ValidarOpcionesOLanzar(IConfiguration configuration, bool esDesarrollo)
    {
        var resultado = Validar(configuration, esDesarrollo);
        if (!resultado.EsValido)
        {
            var detalle = string.Join(Environment.NewLine + " - ", resultado.Errores);
            throw new InvalidOperationException(
                $"La configuración de seguridad del servidor es inválida o está incompleta:{Environment.NewLine} - {detalle}");
        }

        return resultado;
    }

    public static void ValidarClaveJwt(string? secretKey, ICollection<string> errores)
    {
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            errores.Add("Falta configurar el secreto obligatorio 'Jwt:SecretKey' (variable de entorno Jwt__SecretKey).");
            return;
        }

        var valor = secretKey.Trim();
        if (EsMarcadorDePosicion(valor))
        {
            errores.Add("El secreto 'Jwt:SecretKey' contiene un marcador de plantilla sin reemplazar.");
            return;
        }

        if (valor.Length < LongitudMinimaClaveJwt)
        {
            errores.Add($"El secreto 'Jwt:SecretKey' debe tener al menos {LongitudMinimaClaveJwt} caracteres (actual: {valor.Length}).");
            return;
        }

        if (EsClaveJwtDebil(valor))
        {
            errores.Add("El secreto 'Jwt:SecretKey' coincide con un valor débil o comprometido conocido. Genere una clave aleatoria segura de al menos 32 caracteres.");
        }
    }

    public static int ResolverExpiracionJwt(
        string? expiracionMinutosConfig,
        string? expiryMinutesLegacyConfig,
        ICollection<string>? errores = null)
    {
        var valor = !string.IsNullOrWhiteSpace(expiracionMinutosConfig)
            ? expiracionMinutosConfig
            : expiryMinutesLegacyConfig;

        if (string.IsNullOrWhiteSpace(valor))
        {
            return ExpiracionJwtPorDefectoMinutos;
        }

        if (!int.TryParse(valor.Trim(), out var minutos) || minutos < 1 || minutos > ExpiracionJwtMaximaMinutos)
        {
            errores?.Add($"El valor de vigencia JWT ('Jwt:ExpiracionMinutos') debe ser un entero entre 1 y {ExpiracionJwtMaximaMinutos} minutos.");
            return ExpiracionJwtPorDefectoMinutos;
        }

        return minutos;
    }

    public static bool ResolverSeedHabilitado(string? valorConfig, bool esDesarrollo, ICollection<string>? errores = null)
    {
        if (string.IsNullOrWhiteSpace(valorConfig))
        {
            return esDesarrollo;
        }

        if (bool.TryParse(valorConfig.Trim(), out var habilitado))
        {
            return habilitado;
        }

        errores?.Add("El parámetro 'Seed:Habilitado' debe ser 'true' o 'false'.");
        return false;
    }

    public static bool EsClaveJwtDebil(string secretKey)
    {
        var valor = secretKey.Trim();

        if (ClavesDebilesConocidas.Contains(valor))
        {
            return true;
        }

        if (valor.Distinct().Count() < 6)
        {
            return true;
        }

        var hash = CalcularSha256Hex(valor);
        return HashesSha256ClavesComprometidas.Contains(hash);
    }

    public static bool EsMarcadorDePosicion(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            return false;
        }

        var limpio = valor.Trim();
        return (limpio.Contains('<') && limpio.Contains('>')) ||
               limpio.Contains("CAMBIAR", StringComparison.OrdinalIgnoreCase) ||
               limpio.Contains("REEMPLAZAR", StringComparison.OrdinalIgnoreCase) ||
               limpio.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase);
    }

    private static void ValidarCadenaConexion(string? connectionString, ICollection<string> errores)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            errores.Add("Falta configurar 'ConnectionStrings:DefaultConnection' (variable de entorno ConnectionStrings__DefaultConnection).");
            return;
        }

        if (EsMarcadorDePosicion(connectionString))
        {
            errores.Add("La cadena 'ConnectionStrings:DefaultConnection' contiene un marcador de plantilla sin reemplazar.");
        }
    }

    private static void ValidarPasswordSeed(string? passwordInicial, ICollection<string> errores)
    {
        if (string.IsNullOrWhiteSpace(passwordInicial))
        {
            errores.Add("Cuando 'Seed:Habilitado' es true, debe configurar 'Seed:PasswordInicial' (variable Seed__PasswordInicial o user-secrets).");
            return;
        }

        var valor = passwordInicial.Trim();
        if (EsMarcadorDePosicion(valor))
        {
            errores.Add("El valor de 'Seed:PasswordInicial' contiene un marcador de plantilla sin reemplazar.");
            return;
        }

        if (valor.Length < LongitudMinimaPasswordSeed)
        {
            errores.Add($"El valor de 'Seed:PasswordInicial' debe tener al menos {LongitudMinimaPasswordSeed} caracteres.");
        }
    }

    private static string CalcularSha256Hex(string valor)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(valor));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
