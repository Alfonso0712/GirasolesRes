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
                        usuUsuario: "admin",
                        usuNombre: "Administradora General",
                        usuCorreo: "admin@girasoles.com",
                        usuPasswordHash: passwordHash,
                        usuRol: RolUsuario.Administrador,
                        usuActivo: true
                    ),
                    new(
                        usuUsuario: "atorres",
                        usuNombre: "Ana Torres",
                        usuCorreo: "atorres@girasoles.com",
                        usuPasswordHash: passwordHash,
                        usuRol: RolUsuario.Cajero,
                        usuActivo: true
                    ),
                    new(
                        usuUsuario: "lperez",
                        usuNombre: "Luis Pérez",
                        usuCorreo: "lperez@girasoles.com",
                        usuPasswordHash: passwordHash,
                        usuRol: RolUsuario.Mozo,
                        usuActivo: true
                    ),
                    new(
                        usuUsuario: "msoto",
                        usuNombre: "María Soto",
                        usuCorreo: "msoto@girasoles.com",
                        usuPasswordHash: passwordHash,
                        usuRol: RolUsuario.Cocinero,
                        usuActivo: true
                    ),
                    new(
                        usuUsuario: "crojas",
                        usuNombre: "Carlos Rojas (Inactivo)",
                        usuCorreo: "crojas@girasoles.com",
                        usuPasswordHash: passwordHash,
                        usuRol: RolUsuario.Mozo,
                        usuActivo: false
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

            if (!await context.Productos.AnyAsync())
            {
                logger.LogInformation("Sembrando productos iniciales de la carta...");

                var productos = new List<Producto>
                {
                    new("Menú almuerzo", CategoriaProducto.Almuerzo, 8.00m, activo: true),
                    new("Ejecutivo del día", CategoriaProducto.Almuerzo, 12.00m, activo: true),
                    new("Quaker con leche y pan", CategoriaProducto.Desayuno, 3.50m, activo: true),
                    new("Quinua carretillera con pan", CategoriaProducto.Desayuno, 3.00m, activo: true),
                    new("Café pasado con sándwich mixto", CategoriaProducto.Desayuno, 5.00m, activo: true),
                    new("Jarra de chicha morada 1L", CategoriaProducto.Otro, 6.00m, activo: true),
                    new("Porción extra de papas fritas", CategoriaProducto.Otro, 4.00m, activo: true),
                    new("Sopa a la minuta especial", CategoriaProducto.Almuerzo, 10.00m, activo: true),
                    new("Gaseosa 500ml", CategoriaProducto.Otro, 3.50m, activo: true),
                    new("Agua mineral 600ml", CategoriaProducto.Otro, 2.50m, activo: true),
                    new("Caldo de gallina criollo", CategoriaProducto.Desayuno, 10.00m, activo: false) // inactivo de prueba
                };

                await context.Productos.AddRangeAsync(productos);
                await context.SaveChangesAsync();
                logger.LogInformation("Sembrado completado: {Count} productos creados.", productos.Count);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ocurrió un error al ejecutar el sembrado de base de datos.");
            throw;
        }
    }
}
