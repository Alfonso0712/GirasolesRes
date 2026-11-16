namespace GirasolesRes.API.Middleware;

/// <summary>
/// Middleware que añade encabezados HTTP de endurecimiento defensivo en todas las respuestas
/// y refuerza la política no-store en las rutas de autenticación (/api/auth/*).
/// </summary>
public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;
            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "no-referrer";
            headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

            if (context.Request.Path.StartsWithSegments("/api/auth", StringComparison.OrdinalIgnoreCase))
            {
                headers["Cache-Control"] = "no-store";
                headers["Pragma"] = "no-cache";
            }
            else if (!headers.ContainsKey("Cache-Control"))
            {
                // RNF-09: Las respuestas operativas no se almacenan en caché
                headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
                headers["Pragma"] = "no-cache";
            }

            return Task.CompletedTask;
        });

        await _next(context);
    }
}
