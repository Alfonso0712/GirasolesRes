using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GirasolesRes.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<IPerfilService, PerfilService>();
        services.AddScoped<IProductoService, ProductoService>();
        services.AddScoped<IMenuCompletoService, MenuCompletoService>();
        services.AddScoped<IMenuDiaService, MenuDiaService>();
        services.AddScoped<IMesaService, MesaService>();
        services.AddScoped<IPedidoComandoService, PedidoComandoService>();
        services.AddScoped<IPedidoConsultaService, PedidoConsultaService>();
        services.AddScoped<IAvisoComandaService, AvisoComandaService>();
        services.AddScoped<IPedidoService>(sp => new PedidoService(
            sp.GetRequiredService<IPedidoComandoService>(),
            sp.GetRequiredService<IPedidoConsultaService>(),
            sp.GetRequiredService<IAvisoComandaService>()));
        services.AddScoped<IComandaService, ComandaService>();
        services.AddScoped<ICobroService, CobroService>();
        services.AddScoped<ICajaOperacionService, CajaOperacionService>();
        services.AddScoped<ICajaConsultaService, CajaConsultaService>();
        services.AddScoped<ICajaService>(sp => new CajaService(
            sp.GetRequiredService<ICajaOperacionService>(),
            sp.GetRequiredService<ICajaConsultaService>()));
        services.AddScoped<IVentaService, VentaService>();
        services.AddScoped<IReporteService, ReporteService>();
        services.AddScoped<IInicioService, InicioService>();
        return services;
    }
}

