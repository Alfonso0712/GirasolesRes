using System.Text;
using GirasolesRes.API.Middleware;
using GirasolesRes.Application;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Infrastructure;
using GirasolesRes.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Inyección de dependencias de Clean Architecture
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
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

// Configuración de JWT
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "GirasolesRestauranteSuperClaveSecretaSegura2026!@#$%^";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "GirasolesRes";
var audience = builder.Configuration["Jwt:Audience"] ?? "GirasolesResApp";

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

// CORS para React + Vite en desarrollo
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000")
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

    try
    {
        await DatabaseSeeder.SeedAsync(context, passwordHasher, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ocurrió un error al inicializar y sembrar la base de datos.");
    }
}

// Middleware global para manejo homogéneo de excepciones (Clean Architecture)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GirasolesRes API v1");
        c.RoutePrefix = "swagger";
    });
}

// RNF-09: Las pantallas protegidas no se guardan en la caché del navegador
app.Use(async (context, next) =>
{
    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
    context.Response.Headers["Pragma"] = "no-cache";
    await next();
});

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
