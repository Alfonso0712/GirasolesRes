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
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al ejecutar el sembrado inicial de la base de datos.");
            throw;
        }
    }
}
