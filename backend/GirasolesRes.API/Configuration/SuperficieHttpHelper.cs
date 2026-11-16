namespace GirasolesRes.API.Configuration;

/// <summary>
/// Evalúa la lista blanca de orígenes CORS permitidos y la bandera configurable de Swagger.
/// </summary>
public static class SuperficieHttpHelper
{
    public static bool EsSwaggerHabilitado(IConfiguration configuration, bool esDesarrollo)
    {
        var configurado = configuration["Swagger:Habilitado"];
        if (!string.IsNullOrWhiteSpace(configurado) && bool.TryParse(configurado.Trim(), out var valor))
        {
            return valor;
        }

        return esDesarrollo;
    }

    public static bool EsOrigenCorsPermitido(string? origin)
    {
        if (string.IsNullOrWhiteSpace(origin) || string.Equals(origin, "null", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
        {
            return false;
        }

        var host = uri.Host.ToLowerInvariant();

        // Incluye web local (http://localhost:5173) y app Capacitor Android (https://localhost) / iOS (capacitor://localhost)
        if (host == "localhost" || host == "127.0.0.1")
        {
            return true;
        }

        // Dominio de producción y subdominios
        if (host == "girasolesres.pp.ua" || host.EndsWith(".girasolesres.pp.ua", StringComparison.Ordinal))
        {
            return true;
        }

        if (host == "girasoles.astrazynk.pp.ua" || host.EndsWith(".astrazynk.pp.ua", StringComparison.Ordinal))
        {
            return true;
        }

        // Despliegues de Cloudflare Pages (*.pages.dev)
        if (host.EndsWith(".pages.dev", StringComparison.Ordinal))
        {
            return true;
        }

        return false;
    }
}
