namespace GirasolesRes.Infrastructure.Configuration;

/// <summary>
/// Representa el entorno de ejecución de la aplicación sin acoplar Infrastructure a Hosting.
/// </summary>
public sealed record EntornoAplicacion(bool EsDesarrollo);

/// <summary>
/// Opciones tipadas para la generación y validación de tokens JWT.
/// </summary>
public class JwtOpciones
{
    public const string Seccion = "Jwt";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "GirasolesRes";
    public string Audience { get; set; } = "GirasolesResApp";
    public int? ExpiracionMinutos { get; set; }
    public int? ExpiryMinutes { get; set; }
}

/// <summary>
/// Opciones tipadas para la consulta externa de DNI/RUC en ApisPeru.
/// </summary>
public class ApisPeruOpciones
{
    public const string Seccion = "ApisPeru";

    public string BaseUrl { get; set; } = "https://dniruc.apisperu.com/api/v1";
    public string Token { get; set; } = string.Empty;
}

/// <summary>
/// Opciones tipadas para el servicio de correo electrónico y pruebas en desarrollo.
/// </summary>
public class EmailOpciones
{
    public const string Seccion = "Email";

    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "no-reply@girasolesres.pp.ua";
    public string FromName { get; set; } = "Restaurante Girasoles";
    public string? DestinatarioDePrueba { get; set; }
}

/// <summary>
/// Opciones tipadas para el sembrado inicial de usuarios en base de datos.
/// </summary>
public class SeedOpciones
{
    public const string Seccion = "Seed";

    public bool? Habilitado { get; set; }
    public string? PasswordInicial { get; set; }
}

/// <summary>
/// Opciones raíz validadas al arranque para garantizar que no falten secretos ni existan valores débiles.
/// </summary>
public class ConfiguracionSeguridadOpciones
{
    public string ConnectionString { get; set; } = string.Empty;
    public JwtOpciones Jwt { get; set; } = new();
    public ApisPeruOpciones ApisPeru { get; set; } = new();
    public EmailOpciones Email { get; set; } = new();
    public SeedOpciones Seed { get; set; } = new();
    public bool EsDesarrollo { get; set; }
}

/// <summary>
/// Resultado consolidado de la validación de configuración de seguridad al iniciar la aplicación.
/// </summary>
public sealed record ResultadoValidacionConfiguracion(
    bool EsValido,
    IReadOnlyList<string> Errores,
    IReadOnlyList<string> Advertencias,
    string ConnectionString,
    string JwtSecretKey,
    string JwtIssuer,
    string JwtAudience,
    int JwtExpiracionMinutos,
    bool SeedHabilitado,
    string? SeedPasswordInicial);
