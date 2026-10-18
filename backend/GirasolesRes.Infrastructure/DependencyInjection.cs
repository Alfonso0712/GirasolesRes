using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using GirasolesRes.Infrastructure.Security;
using GirasolesRes.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GirasolesRes.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Port=5432;Database=girasoles_db;Username=postgres;Password=73268812";

        services.AddDbContext<GirasolesDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositorios asíncronos desacoplados en Infrastructure/Repositories
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IRegistroIngresoRepository, RegistroIngresoRepository>();
        services.AddScoped<ICodigoRecuperacionRepository, CodigoRecuperacionRepository>();
        services.AddScoped<IAuditoriaUsuarioRepository, AuditoriaUsuarioRepository>();
        services.AddScoped<ITokenRevocadoRepository, TokenRevocadoRepository>();
        services.AddScoped<IMesaRepository, MesaRepository>();
        services.AddScoped<IAuditoriaMesaRepository, AuditoriaMesaRepository>();
        services.AddScoped<IProductoRepository, ProductoRepository>();
        services.AddScoped<IMenuDiaRepository, MenuDiaRepository>();
        services.AddScoped<IPedidoRepository, PedidoRepository>();

        // Seguridad y Servicios
        services.AddSingleton<IPasswordHasherService, PasswordHasherService>();
        services.AddScoped<IJwtGenerator, JwtGenerator>();
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }
}
