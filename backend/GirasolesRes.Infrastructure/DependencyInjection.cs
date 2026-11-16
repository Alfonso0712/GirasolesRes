using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Infrastructure.Configuration;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using GirasolesRes.Infrastructure.Security;
using GirasolesRes.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;


namespace GirasolesRes.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Falta configurar 'ConnectionStrings:DefaultConnection'. Defínala mediante variables de entorno, user-secrets o appsettings no versionado.");
        }

        services.AddSingleton<IValidateOptions<ConfiguracionSeguridadOpciones>, ConfiguracionSeguridadValidator>();

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
        services.AddScoped<IMenuCompletoRepository, MenuCompletoRepository>();
        services.AddScoped<IMenuDiaRepository, MenuDiaRepository>();
        services.AddScoped<IPedidoRepository, PedidoRepository>();
        services.AddScoped<IComandaRepository, ComandaRepository>();
        services.AddScoped<IVentaRepository, VentaRepository>();
        services.AddScoped<IComprobanteRepository, ComprobanteRepository>();
        services.AddScoped<ICajaRepository, CajaRepository>();
        services.AddScoped<IAuditoriaCobroRepository, AuditoriaCobroRepository>();
        services.AddScoped<IReporteRepository, ReporteRepository>();

        // Seguridad y Servicios
        services.AddSingleton<IPasswordHasherService, PasswordHasherService>();
        services.AddScoped<IJwtGenerator, JwtGenerator>();

        // Resend SDK oficial para despacho de correos
        // Servicio de despacho de correos (Mailjet API v3.1)

        services.AddHttpClient<IEmailService, EmailService>();

        services.AddScoped<IPdfCierreService, PdfCierreService>();
        services.AddScoped<IPdfReporteService, ReportePdfService>();
        services.AddScoped<IPdfComprobanteService, PdfComprobanteService>();
        services.AddHttpClient<IConsultaDocumentoService, ConsultaDocumentoService>();

        return services;
    }
}
