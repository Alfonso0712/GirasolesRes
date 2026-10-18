using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GirasolesRes.Tests;

public class CajaRepositoryQueryCompatibilityTests
{
    private static GirasolesDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new GirasolesDbContext(options);
    }

    private static Usuario CreateTestUser(string username, RolUsuario rol = RolUsuario.Cajero)
    {
        return new Usuario(
            usuUsuario: username,
            usuNombre: "Nombre " + username,
            usuCorreo: username + "@test.com",
            usuPasswordHash: "hash123",
            usuRol: rol
        );
    }

    [Fact]
    public async Task ObtenerCajaAbiertaAsync_Returns_Active_Open_Register_With_User_Included()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        var caja = new Caja(user.Id_Usuario, 150.00m, "sol-open-1");

        await context.Usuarios.AddAsync(user);
        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        var result = await repo.ObtenerCajaAbiertaAsync();

        Assert.NotNull(result);
        Assert.Equal(caja.Id_Caja, result!.Id_Caja);
        Assert.NotNull(result.Caj_Usuario);
        Assert.Equal("cajero1", result.Caj_Usuario!.Usu_Usuario);
    }

    [Fact]
    public async Task ObtenerUltimaCajaCerradaAsync_Returns_Most_Recent_Closed_Register()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        // Caja 1: Closed earlier
        var caja1 = new Caja(user.Id_Usuario, 100.00m, "sol-1");
        caja1.Cerrar(100.00m);
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaCierreUtc))!
            .SetValue(caja1, DateTime.UtcNow.AddHours(-10));

        // Caja 2: Closed later
        var caja2 = new Caja(user.Id_Usuario, 200.00m, "sol-2");
        caja2.Cerrar(200.00m);
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaCierreUtc))!
            .SetValue(caja2, DateTime.UtcNow.AddHours(-2));

        // Caja 3: Still open (should be ignored)
        var caja3 = new Caja(user.Id_Usuario, 300.00m, "sol-3");

        await context.Cajas.AddRangeAsync(caja1, caja2, caja3);
        await context.SaveChangesAsync();

        var result = await repo.ObtenerUltimaCajaCerradaAsync();

        Assert.NotNull(result);
        Assert.Equal(caja2.Id_Caja, result!.Id_Caja);
        Assert.Equal(200.00m, result.Caj_MontoCierre);
    }

    [Fact]
    public async Task ObtenerPorSolicitudIdAsync_Finds_By_Opening_Or_Closing_Token()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        var caja = new Caja(user.Id_Usuario, 100.00m, "sol-apertura-abc");
        caja.Cerrar(
            idUsuarioCierre: user.Id_Usuario,
            efectivoContado: 100.00m,
            efectivoEsperado: 100.00m,
            totalVentasEfectivo: 0,
            totalVentasYape: 0,
            totalVentas: 0,
            cantidadVentas: 0,
            observacion: "Cierre normal",
            solicitudIdCierre: "sol-cierre-xyz"
        );

        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        // Find by opening token
        var byApertura = await repo.ObtenerPorSolicitudIdAsync("sol-apertura-abc");
        Assert.NotNull(byApertura);
        Assert.Equal(caja.Id_Caja, byApertura!.Id_Caja);

        // Find by closing token
        var byCierre = await repo.ObtenerPorSolicitudIdAsync("sol-cierre-xyz");
        Assert.NotNull(byCierre);
        Assert.Equal(caja.Id_Caja, byCierre!.Id_Caja);

        // Blank/null token returns null
        Assert.Null(await repo.ObtenerPorSolicitudIdAsync(""));
        Assert.Null(await repo.ObtenerPorSolicitudIdAsync("   "));
        Assert.Null(await repo.ObtenerPorSolicitudIdAsync("non-existent"));
    }

    [Fact]
    public async Task ObtenerHistorialPaginadoAsync_Pagination_And_Count()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("admin");
        await context.Usuarios.AddAsync(user);

        // Create 25 cajas
        for (int i = 0; i < 25; i++)
        {
            var c = new Caja(user.Id_Usuario, 100.00m + i, "sol-" + i);
            typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
                .SetValue(c, DateTime.UtcNow.AddMinutes(-i * 10));
            await context.Cajas.AddAsync(c);
        }
        await context.SaveChangesAsync();

        // Page 1 (tamano 20)
        var (itemsPage1, total) = await repo.ObtenerHistorialPaginadoAsync(null, null, 1, 20);
        Assert.Equal(25, total);
        Assert.Equal(20, itemsPage1.Count);

        // Page 2 (tamano 20)
        var (itemsPage2, total2) = await repo.ObtenerHistorialPaginadoAsync(null, null, 2, 20);
        Assert.Equal(25, total2);
        Assert.Equal(5, itemsPage2.Count);

        // Order is descending by opening date
        Assert.True(itemsPage1[0].Caj_FechaAperturaUtc >= itemsPage1[1].Caj_FechaAperturaUtc);
    }

    [Fact]
    public async Task ObtenerPorIdConDetallesAsync_Loads_Complex_Graph_Without_Error()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        var admin = CreateTestUser("admin", RolUsuario.Administrador);
        await context.Usuarios.AddRangeAsync(user, admin);

        var mesa = new Mesa("Mesa 1");
        await context.Mesas.AddAsync(mesa);

        var producto = new Producto("Lomo Saltado", CategoriaProducto.Almuerzo, 35.00m);
        await context.Productos.AddAsync(producto);

        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), mesa.Id_Mesa, user.Id_Usuario, "sol-ped-1");
        pedido.AgregarOLinea(producto.Id_Producto, 2, 35.00m, "Bien cocido");
        await context.Pedidos.AddAsync(pedido);

        var caja = new Caja(user.Id_Usuario, 100.00m, "sol-caja-detail");
        await context.Cajas.AddAsync(caja);

        var venta = new Venta(
            idPedido: pedido.Id_Pedido,
            idUsuario: user.Id_Usuario,
            idCaja: caja.Id_Caja,
            venTotal: 70.00m,
            venMetodoPago: MetodoPago.Efectivo,
            venMontoRecibido: 100.00m,
            venVuelto: 30.00m,
            venSolicitudId: "sol-ven-1"
        );
        await context.Ventas.AddAsync(venta);

        var comprobante = new Comprobante(
            idVenta: venta.Id_Venta,
            comNumero: 1,
            comTotal: 70.00m,
            comMetodoPago: MetodoPago.Efectivo
        );
        await context.Comprobantes.AddAsync(comprobante);

        await context.SaveChangesAsync();

        // ACT
        var result = await repo.ObtenerPorIdConDetallesAsync(caja.Id_Caja);

        // ASSERT
        Assert.NotNull(result);
        Assert.Equal(caja.Id_Caja, result!.Id_Caja);
        Assert.NotNull(result.Caj_Usuario);
        Assert.NotNull(result.Caj_Ventas);
        Assert.Single(result.Caj_Ventas);

        var vLoaded = result.Caj_Ventas.First();
        Assert.Equal(venta.Id_Venta, vLoaded.Id_Venta);
        Assert.NotNull(vLoaded.Ven_Pedido);
        Assert.Equal(pedido.Id_Pedido, vLoaded.Ven_Pedido!.Id_Pedido);
        Assert.NotNull(vLoaded.Ven_Comprobante);
        Assert.Equal(comprobante.Id_Comprobante, vLoaded.Ven_Comprobante!.Id_Comprobante);
    }
}
