using GirasolesRes.Application.Interfaces.Security;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GirasolesRes.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(GirasolesDbContext context, IPasswordHasherService passwordHasher, ILogger logger)
    {
        try
        {
            await context.Database.EnsureCreatedAsync();

            if (!await context.Usuarios.AnyAsync())
            {
                logger.LogInformation("Iniciando sembrado inicial de usuarios para el Restaurante Girasoles...");

                var defaultPassword = "Password123!";
                var passwordHash = passwordHasher.HashPassword(defaultPassword);

                var usuarios = new List<Usuario>
                {
                    new(
                        nombreUsuario: "admin",
                        nombreCompleto: "Administradora General",
                        correo: "admin@girasoles.com",
                        passwordHash: passwordHash,
                        rol: RolUsuario.Administrador,
                        activo: true
                    ),
                    new(
                        nombreUsuario: "atorres",
                        nombreCompleto: "Ana Torres",
                        correo: "atorres@girasoles.com",
                        passwordHash: passwordHash,
                        rol: RolUsuario.Cajero,
                        activo: true
                    ),
                    new(
                        nombreUsuario: "lperez",
                        nombreCompleto: "Luis Pérez",
                        correo: "lperez@girasoles.com",
                        passwordHash: passwordHash,
                        rol: RolUsuario.Mozo,
                        activo: true
                    ),
                    new(
                        nombreUsuario: "msoto",
                        nombreCompleto: "María Soto",
                        correo: "msoto@girasoles.com",
                        passwordHash: passwordHash,
                        rol: RolUsuario.Cocinero,
                        activo: true
                    ),
                    new(
                        nombreUsuario: "crojas",
                        nombreCompleto: "Carlos Rojas (Inactivo)",
                        correo: "crojas@girasoles.com",
                        passwordHash: passwordHash,
                        rol: RolUsuario.Mozo,
                        activo: false
                    )
                };

                await context.Usuarios.AddRangeAsync(usuarios);
                await context.SaveChangesAsync();

                logger.LogInformation("Sembrado completado: 5 usuarios creados con contraseña '{Password}'", defaultPassword);
            }

            if (!await context.Mesas.AnyAsync())
            {
                logger.LogInformation("Iniciando sembrado inicial de mesas para el Restaurante Girasoles...");

                var m1 = new Mesa("Mesa 1");
                var m2 = new Mesa("Mesa 2");
                var m3 = new Mesa("Mesa 3");
                m3.CambiarOcupacion(EstadoOcupacionMesa.Ocupada);
                var m4 = new Mesa("Mesa 4");
                var m5 = new Mesa("Mesa 5");
                var m6 = new Mesa("Mesa 6");
                var m7 = new Mesa("Mesa 7");
                m7.CambiarOcupacion(EstadoOcupacionMesa.Ocupada);
                var m8 = new Mesa("Mesa 8");
                var m9 = new Mesa("Mesa 9");
                var m10 = new Mesa("Mesa 10");
                var m11 = new Mesa("Patio 1");
                var m12 = new Mesa("Patio 2");
                m12.CambiarActiva(false); // Inactiva para probar el filtro de Administrador

                var mesas = new List<Mesa> { m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12 };

                await context.Mesas.AddRangeAsync(mesas);
                await context.SaveChangesAsync();

                logger.LogInformation("Sembrado completado: {Count} mesas iniciales creadas.", mesas.Count);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al ejecutar el sembrado inicial de la base de datos.");
            throw;
        }
    }
}
