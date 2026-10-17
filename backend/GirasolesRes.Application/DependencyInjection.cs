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
        services.AddScoped<IMesaService, MesaService>();
        return services;
    }
}
