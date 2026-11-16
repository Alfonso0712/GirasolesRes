using System.Net;
using System.Text;
using GirasolesRes.API.Configuration;
using GirasolesRes.API.Middleware;
using GirasolesRes.Application;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Infrastructure;
using GirasolesRes.Infrastructure.Configuration;
using GirasolesRes.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Validación temprana de secretos y configuración de seguridad (sin valores sensibles por defecto)
var configuracionSeguridad = ConfiguracionSeguridadValidator.ValidarOpcionesOLanzar(
    builder.Configuration,
    builder.Environment.IsDevelopment());

var swaggerHabilitado = SuperficieHttpHelper.EsSwaggerHabilitado(
    builder.Configuration,
    builder.Environment.IsDevelopment());

var rateLimitConfig = RateLimitHelper.LeerConfiguracion(builder.Configuration);

// Limitación de tasa: política estricta para autenticación por IP real (vía ForwardedHeaders)
// y límite global generoso por usuario autenticado o IP para no afectar el sondeo normal.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = (rejectedContext, ct) =>
        RateLimitHelper.EscribirRespuestaRechazoAsync(rejectedContext, rateLimitConfig.AutenticacionVentanaSegundos, ct);

    options.AddPolicy(
        RateLimitConfiguracion.PoliticaAutenticacion,
        httpContext => RateLimitHelper.ConstruirParticionAutenticacion(httpContext, rateLimitConfig));

    options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<HttpContext, string>(
        httpContext => RateLimitHelper.ConstruirParticionGlobal(httpContext, rateLimitConfig));
});

// Encabezados reenviados: confiar únicamente en el proxy local (loopback) detrás del túnel HTTPS
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
    options.KnownProxies.Add(IPAddress.Loopback);
    options.KnownProxies.Add(IPAddress.IPv6Loopback);
});

builder.Services.AddHsts(options =>
{
    options.Preload = false;
    options.IncludeSubDomains = false;
    options.MaxAge = TimeSpan.FromDays(365);
});

// Inyección de dependencias de Clean Architecture
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment.IsDevelopment());

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

if (swaggerHabilitado)
{
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "GirasolesRes API",
            Version = "v1",
            Description = "API REST del Sistema de Gestión de Restaurante Girasoles (Clean Architecture)"
        });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Ingrese su token JWT (sin escribir Bearer, Swagger lo antepone automáticamente)."
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });
}

// Configuración de JWT (validada previamente al arranque)
var secretKey = configuracionSeguridad.JwtSecretKey;
var issuer = configuracionSeguridad.JwtIssuer;
var audience = configuracionSeguridad.JwtAudience;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var jti = context.Principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
            if (!string.IsNullOrEmpty(jti))
            {
                var tokenRevocadoRepo = context.HttpContext.RequestServices.GetRequiredService<ITokenRevocadoRepository>();
                if (await tokenRevocadoRepo.EstaRevocadoAsync(jti))
                {
                    context.Fail("Token revocado.");
                    return;
                }
            }

            // RN-12 (CUS-02): Validar en cada petición autenticada que el usuario siga en estado Activo y no esté bloqueado
            var userIdStr = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                            ?? context.Principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                var usuarioRepo = context.HttpContext.RequestServices.GetRequiredService<IUsuarioRepository>();
                var usuario = await usuarioRepo.ObtenerPorIdAsync(userId);
                if (usuario == null || !usuario.Usu_Activo || usuario.EstaBloqueado())
                {
                    context.Fail("Usuario inactivo o bloqueado.");
                    return;
                }
            }
        },
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"success\":false,\"message\":\"No autorizado o sesión vencida. Inicie sesión para continuar.\"}");
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"success\":false,\"message\":\"No tiene permiso para usar esta función.\",\"error\":\"No tiene permiso para usar esta función.\"}");
        }
    };
});

builder.Services.AddAuthorization();

// CORS para React + Vite en desarrollo, app móvil Capacitor (https://localhost) y Cloudflare Pages en producción
// Se rechaza origen nulo o vacío para evitar omisiones vía iframe sandbox o file://;
// https://localhost y http://localhost quedan cubiertos explícitamente por la regla de host == "localhost".
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(SuperficieHttpHelper.EsOrigenCorsPermitido)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Inicialización de base de datos y seed en Infrastructure/Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<GirasolesDbContext>();
    var passwordHasher = services.GetRequiredService<IPasswordHasherService>();

    foreach (var advertencia in configuracionSeguridad.Advertencias)
    {
        logger.LogWarning("{AdvertenciaConfiguracion}", advertencia);
    }

    try
    {
        await DatabaseSeeder.SeedAsync(
            context,
            passwordHasher,
            logger,
            configuracionSeguridad.SeedHabilitado,
            configuracionSeguridad.SeedPasswordInicial);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ocurrió un error al inicializar y sembrar la base de datos.");
    }
}

// Orden del pipeline HTTP: primero encabezados reenviados del proxy local y cabeceras de seguridad
app.UseForwardedHeaders();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (!app.Environment.IsDevelopment())
{
    // HSTS solo en producción; UseHttpsRedirection() no se activa porque Kestrel escucha solo HTTP (:5050)
    // detrás del túnel Cloudflare / proxy inverso y redirigir a HTTPS sin puerto TLS local causaría bucles.
    app.UseHsts();
}

// Middleware global para manejo homogéneo de excepciones (Clean Architecture)
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Swagger habilitado solo si Swagger:Habilitado=true (por defecto true en Development, false en Production)
if (swaggerHabilitado)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GirasolesRes API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

app.Run();
