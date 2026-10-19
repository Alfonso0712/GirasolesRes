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
                    // a) Desayunos individuales y panes/acompañamientos
                    new("Café pasado", CategoriaProducto.Desayuno, 3.50m, proActivo: true),
                    new("Té e infusiones variadas", CategoriaProducto.Desayuno, 2.50m, proActivo: true),
                    new("Quaker con leche", CategoriaProducto.Desayuno, 3.50m, proActivo: true),
                    new("Quinua carretillera", CategoriaProducto.Desayuno, 3.00m, proActivo: true),
                    new("Jugo surtido", CategoriaProducto.Desayuno, 6.00m, proActivo: true),
                    new("Jugo de papaya", CategoriaProducto.Desayuno, 5.00m, proActivo: true),
                    new("Pan con palta", CategoriaProducto.Desayuno, 3.50m, proActivo: true),
                    new("Pan con queso", CategoriaProducto.Desayuno, 3.50m, proActivo: true),
                    new("Pan con chicharrón", CategoriaProducto.Desayuno, 8.00m, proActivo: true),
                    new("Pan con huevo frito", CategoriaProducto.Desayuno, 3.00m, proActivo: true),
                    new("Pan con salchipollo", CategoriaProducto.Desayuno, 4.50m, proActivo: true),
                    new("Pan con pollo deshilachado", CategoriaProducto.Desayuno, 4.50m, proActivo: true),

                    // b) Almuerzos y Sopas/Entradas
                    new("Caldo de gallina (Entrada)", CategoriaProducto.Almuerzo, 5.00m, proActivo: true),
                    new("Sopa a la minuta", CategoriaProducto.Almuerzo, 7.00m, proActivo: true),
                    new("Sopa criolla", CategoriaProducto.Almuerzo, 8.00m, proActivo: true),
                    new("Papa a la huancaína (Entrada)", CategoriaProducto.Almuerzo, 5.00m, proActivo: true),
                    new("Ocopa arequipeña (Entrada)", CategoriaProducto.Almuerzo, 5.00m, proActivo: true),
                    new("Menú almuerzo", CategoriaProducto.Almuerzo, 8.00m, proActivo: true),
                    new("Ejecutivo del día", CategoriaProducto.Almuerzo, 12.00m, proActivo: true),
                    new("Menú ejecutivo de la casa", CategoriaProducto.Almuerzo, 14.00m, proActivo: true),

                    // c) Platos Extras / A la Carta
                    new("Caldo de gallina criollo (Plato fuerte)", CategoriaProducto.PlatosExtras, 10.00m, proActivo: true),
                    new("Lomo saltado", CategoriaProducto.PlatosExtras, 25.00m, proActivo: true),
                    new("Ceviche mixto", CategoriaProducto.PlatosExtras, 28.00m, proActivo: true),
                    new("Ceviche de trucha", CategoriaProducto.PlatosExtras, 24.00m, proActivo: true),
                    new("Bistec a lo pobre", CategoriaProducto.PlatosExtras, 26.00m, proActivo: true),
                    new("Pollo a la plancha", CategoriaProducto.PlatosExtras, 20.00m, proActivo: true),
                    new("Arroz chaufa de pollo", CategoriaProducto.PlatosExtras, 18.00m, proActivo: true),
                    new("Arroz chaufa de carne", CategoriaProducto.PlatosExtras, 22.00m, proActivo: true),
                    new("Seco de pollo", CategoriaProducto.PlatosExtras, 20.00m, proActivo: true),
                    new("Seco de res", CategoriaProducto.PlatosExtras, 24.00m, proActivo: true),
                    new("Tallarines verdes con bistec", CategoriaProducto.PlatosExtras, 25.00m, proActivo: true),

                    // d) Combinados
                    new("Dúo marino (Arroz con mariscos + ceviche)", CategoriaProducto.Combinados, 32.00m, proActivo: true),
                    new("Chaufa con chicharrón de pollo", CategoriaProducto.Combinados, 22.00m, proActivo: true),
                    new("Chaufa + Ceviche clásico", CategoriaProducto.Combinados, 28.00m, proActivo: true),

                    // e) Bebidas y Refrescos
                    new("Coca-Cola Personal 500ml", CategoriaProducto.Bebidas, 3.50m, proActivo: true),
                    new("Coca-Cola Familiar 1.5L", CategoriaProducto.Bebidas, 9.00m, proActivo: true),
                    new("Inca Kola Personal 500ml", CategoriaProducto.Bebidas, 3.50m, proActivo: true),
                    new("Inca Kola Familiar 1.5L", CategoriaProducto.Bebidas, 9.00m, proActivo: true),
                    new("Agua mineral 600ml", CategoriaProducto.Bebidas, 2.50m, proActivo: true),
                    new("Agua mineral 700ml", CategoriaProducto.Bebidas, 3.00m, proActivo: true),
                    new("Jarra de chicha morada 500ml", CategoriaProducto.Bebidas, 4.00m, proActivo: true),
                    new("Jarra de chicha morada 1L", CategoriaProducto.Bebidas, 7.00m, proActivo: true),
                    new("Jarra de maracuyá 500ml", CategoriaProducto.Bebidas, 4.00m, proActivo: true),
                    new("Jarra de maracuyá 1L", CategoriaProducto.Bebidas, 7.00m, proActivo: true),
                    new("Jarra de limonada clásica 500ml", CategoriaProducto.Bebidas, 4.00m, proActivo: true),
                    new("Jarra de limonada clásica 1L", CategoriaProducto.Bebidas, 7.00m, proActivo: true),
                    new("Jarra de limonada frozen 500ml", CategoriaProducto.Bebidas, 5.50m, proActivo: true),
                    new("Jarra de limonada frozen 1L", CategoriaProducto.Bebidas, 9.00m, proActivo: true),

                    // f) Otro
                    new("Porción extra de papas fritas", CategoriaProducto.Otro, 4.00m, proActivo: true),
                    new("Porción de arroz blanco", CategoriaProducto.Otro, 3.00m, proActivo: true),
                    new("Porción de canchita serrana", CategoriaProducto.Otro, 2.50m, proActivo: true)
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
