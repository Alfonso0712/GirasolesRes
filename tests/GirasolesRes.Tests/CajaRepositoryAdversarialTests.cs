using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GirasolesRes.Tests;

public class CajaRepositoryAdversarialTests
{
    private static GirasolesDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new GirasolesDbContext(options);
    }

    private static Usuario CreateTestUser(string username)
    {
        return new Usuario(
            usuUsuario: username,
            usuNombre: "Usuario " + username,
            usuCorreo: username + "@test.com",
            usuPasswordHash: "hash123",
            usuRol: RolUsuario.Cajero
        );
    }

    [Fact]
    public async Task ObtenerHistorialPaginadoAsync_Multiple_Ventas_Per_Caja_Does_Not_Multiply_Total_Count()
    {
        // ARRANGE:
        // Caja has 3 Ventas.
        // If Include(c => c.Caj_Ventas) affected CountAsync(), count would be 3 instead of 1.
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        var mesa = new Mesa("Mesa 1");
        await context.Mesas.AddAsync(mesa);

        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), mesa.Id_Mesa, user.Id_Usuario, "sol-ped-1");
        await context.Pedidos.AddAsync(pedido);

        var caja = new Caja(user.Id_Usuario, 100.00m, "sol-caja-multiventas");
        await context.Cajas.AddAsync(caja);

        for (int i = 0; i < 3; i++)
        {
            var venta = new Venta(
                idPedido: pedido.Id_Pedido,
                idUsuario: user.Id_Usuario,
                idCaja: caja.Id_Caja,
                venTotal: 20.00m,
                venMetodoPago: MetodoPago.Efectivo,
                venMontoRecibido: 20.00m,
                venVuelto: 0m,
                venSolicitudId: "sol-venta-" + i
            );
            await context.Ventas.AddAsync(venta);
        }

        await context.SaveChangesAsync();

        // ACT:
        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(null, null, 1, 20);

        // ASSERT: Total must be 1 caja, and items must have 1 caja
        Assert.Equal(1, total);
        Assert.Single(items);
        Assert.Equal(3, items[0].Caj_Ventas.Count);
    }

    [Fact]
    public async Task ObtenerHistorialPaginadoAsync_Unspecified_Date_Filter_Includes_Full_Lima_Day()
    {
        // ARRANGE:
        // A register opened on 2026-10-18 at 20:00 Lima time = 2026-10-19 01:00 UTC.
        // Admin filters desde = 2026-10-18, hasta = 2026-10-18 (Unspecified DateTimeKind).
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        var caja = new Caja(user.Id_Usuario, 100.00m, "sol-caja-noche");
        // 20:00 Lima = 01:00 UTC next day
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(caja, new DateTime(2026, 10, 19, 1, 0, 0, DateTimeKind.Utc));

        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        // ACT:
        // When filtered with Unspecified kind:
        var desde = new DateTime(2026, 10, 18, 0, 0, 0, DateTimeKind.Unspecified);
        var hasta = new DateTime(2026, 10, 18, 0, 0, 0, DateTimeKind.Unspecified);

        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(desde, hasta, 1, 20);

        // ASSERT:
        // Unspecified kind uses:
        // desdeUtc = 2026-10-18 05:00 UTC (00:00 Lima)
        // hastaUtc = 2026-10-18 23:59:59.999 + 5h = 2026-10-19 04:59:59.999 UTC (23:59:59.999 Lima)
        // 2026-10-19 01:00 UTC falls in range [2026-10-18 05:00, 2026-10-19 04:59:59] -> INCLUDED!
        Assert.Equal(1, total);
        Assert.Single(items);
    }

    [Fact]
    public async Task ObtenerHistorialPaginadoAsync_Adversarial_Utc_Date_Filter_Behavior()
    {
        // STRESS-TESTING ASSUMPTION:
        // If a caller passes `hasta` as a UTC date at 00:00:00Z (e.g. DateTime.Parse("2026-10-18T00:00:00Z")),
        // CajaRepository checks `hasta.Value.Kind == DateTimeKind.Utc` and uses `hasta.Value` directly without AddDays(1) or AddHours(5).
        // Let's verify what happens when `hasta` is Utc 00:00:00 vs when `hasta` is an actual full range or Unspecified.
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        var cajaMediodia = new Caja(user.Id_Usuario, 100.00m, "sol-caja-mediodia");
        // Opened at 12:00 Lima = 17:00 UTC
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaMediodia, new DateTime(2026, 10, 18, 17, 0, 0, DateTimeKind.Utc));

        await context.Cajas.AddAsync(cajaMediodia);
        await context.SaveChangesAsync();

        // If caller passes UTC midnight (2026-10-18 00:00:00Z):
        var hastaUtcMidnight = new DateTime(2026, 10, 18, 0, 0, 0, DateTimeKind.Utc);
        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(null, hastaUtcMidnight, 1, 20);

        // With the fix applied, passing UTC midnight extends to the end of the Lima day (05:00 UTC next day),
        // so the register opened at 17:00 UTC (12:00 Lima) IS correctly included!
        Assert.Equal(1, total);
        Assert.Single(items);

        // Now if caller passes end-of-day UTC or Unspecified:
        var hastaUnspecified = new DateTime(2026, 10, 18, 0, 0, 0, DateTimeKind.Unspecified);
        var (itemsOk, totalOk) = await repo.ObtenerHistorialPaginadoAsync(null, hastaUnspecified, 1, 20);
        Assert.Equal(1, totalOk);
        Assert.Single(itemsOk);
    }

    [Fact]
    public async Task ObtenerHistorialPaginadoAsync_Zero_Or_Negative_Pagination_Parameters_Defaults_Safely()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("admin");
        await context.Usuarios.AddAsync(user);

        var caja = new Caja(user.Id_Usuario, 100.00m, "sol-1");
        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        // pagina = 0, tamano = 0
        var (items1, total1) = await repo.ObtenerHistorialPaginadoAsync(null, null, 0, 0);
        Assert.Equal(1, total1);
        Assert.Single(items1);

        // pagina = -5, tamano = -10
        var (items2, total2) = await repo.ObtenerHistorialPaginadoAsync(null, null, -5, -10);
        Assert.Equal(1, total2);
        Assert.Single(items2);
    }

    [Fact]
    public async Task ObtenerVentasPorCajaIdAsync_Returns_Only_Vigente_Sales_Excluding_Anuladas()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        var caja = new Caja(user.Id_Usuario, 100.00m, "sol-caja-test");
        await context.Cajas.AddAsync(caja);

        var mesa = new Mesa("Mesa 1");
        await context.Mesas.AddAsync(mesa);

        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), mesa.Id_Mesa, user.Id_Usuario, "sol-ped-1");
        await context.Pedidos.AddAsync(pedido);

        // Venta 1: Vigente (S/ 50.00)
        var ventaVigente = new Venta(
            idPedido: pedido.Id_Pedido,
            idUsuario: user.Id_Usuario,
            idCaja: caja.Id_Caja,
            venTotal: 50.00m,
            venMetodoPago: MetodoPago.Efectivo,
            venSolicitudId: "sol-v-vigente"
        );

        // Venta 2: Anulada (S/ 30.00)
        var ventaAnulada = new Venta(
            idPedido: pedido.Id_Pedido,
            idUsuario: user.Id_Usuario,
            idCaja: caja.Id_Caja,
            venTotal: 30.00m,
            venMetodoPago: MetodoPago.Efectivo,
            venSolicitudId: "sol-v-anulada"
        );
        ventaAnulada.Anular("Error en digitación", "cajero1", "Ninguno");

        await context.Ventas.AddRangeAsync(ventaVigente, ventaAnulada);
        await context.SaveChangesAsync();

        // ACT
        var ventas = await repo.ObtenerVentasPorCajaIdAsync(caja.Id_Caja);

        // ASSERT: Only the active sale is retrieved
        Assert.Single(ventas);
        Assert.Equal(ventaVigente.Id_Venta, ventas[0].Id_Venta);
        Assert.Equal(EstadoVenta.Vigente, ventas[0].Ven_Estado);
    }
}
