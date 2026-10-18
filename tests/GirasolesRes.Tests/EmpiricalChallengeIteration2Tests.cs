using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GirasolesRes.Tests;

public class EmpiricalChallengeIteration2Tests
{
    private const string PostgresConnectionString = "Host=localhost;Port=5433;Database=girasoles_db;Username=postgres;Password=1234";

    private static GirasolesDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new GirasolesDbContext(options);
    }

    private static GirasolesDbContext CreatePostgresDbContext()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseNpgsql(PostgresConnectionString)
            .Options;

        return new GirasolesDbContext(options);
    }

    private static Usuario CreateTestUser(string username, RolUsuario rol = RolUsuario.Cajero)
    {
        return new Usuario(
            usuUsuario: username,
            usuNombre: "Usuario " + username,
            usuCorreo: username + "@test.com",
            usuPasswordHash: "hash123",
            usuRol: rol
        );
    }

    // =========================================================================
    // DEFECT 1: Legacy NULL rows materialization in cajas
    // =========================================================================

    [Fact]
    public async Task Defect1_InMemory_Legacy_Caja_With_All_Nullable_Columns_Null_Loads_Without_InvalidCastException()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        // Create a Caja entity simulating legacy data before CUS 13 columns existed
        var caja = new Caja(user.Id_Usuario, 100.00m, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_SolicitudId))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_MontoEsperado))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_Diferencia))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_TotalVentasEfectivo))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_TotalVentasYape))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_TotalVentas))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_CantidadVentas))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_Observacion))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Id_UsuarioCierre))!.SetValue(caja, null);
        typeof(Caja).GetProperty(nameof(Caja.Caj_SolicitudIdCierre))!.SetValue(caja, null);

        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        // ACT & ASSERT: ObtenerPorIdConDetallesAsync must NOT throw InvalidCastException
        var loadedDetalles = await repo.ObtenerPorIdConDetallesAsync(caja.Id_Caja);
        Assert.NotNull(loadedDetalles);
        Assert.Equal(caja.Id_Caja, loadedDetalles!.Id_Caja);
        Assert.Null(loadedDetalles.Caj_SolicitudId);
        Assert.Null(loadedDetalles.Caj_MontoEsperado);
        Assert.Null(loadedDetalles.Caj_Diferencia);
        Assert.Null(loadedDetalles.Caj_TotalVentasEfectivo);
        Assert.Null(loadedDetalles.Caj_TotalVentasYape);
        Assert.Null(loadedDetalles.Caj_TotalVentas);
        Assert.Null(loadedDetalles.Caj_CantidadVentas);
        Assert.Null(loadedDetalles.Caj_Observacion);
        Assert.Null(loadedDetalles.Id_UsuarioCierre);
        Assert.Null(loadedDetalles.Caj_UsuarioCierre);
        Assert.Null(loadedDetalles.Caj_SolicitudIdCierre);

        // ACT & ASSERT: ObtenerHistorialPaginadoAsync must NOT throw InvalidCastException
        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(null, null, 1, 20);
        Assert.Equal(1, total);
        Assert.Single(items);
        Assert.Equal(caja.Id_Caja, items[0].Id_Caja);
        Assert.Null(items[0].Caj_SolicitudId);
    }

    [Fact]
    public async Task Defect1_Postgres_RawSql_Legacy_Caja_With_Null_SolicitudId_And_Null_Cierre_Loads_Without_InvalidCastException()
    {
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        await using var tx = await context.Database.BeginTransactionAsync();
        try
        {
            var user = await context.Usuarios.FirstAsync();
            var legacyCajaId = Guid.NewGuid();

            // Insert directly via raw SQL with NULL in caj_solicitud_id and all closure columns
            // Simulating legacy row created in previous iterations/schema versions
            var insertSql = @"
                INSERT INTO public.cajas (
                    id_caja, id_usuario, caj_monto_apertura, caj_monto_cierre,
                    caj_fec_apertura_utc, caj_fec_cierre_utc, caj_estado,
                    fec_creacion_utc, fec_actualizacion_utc,
                    caj_mon_esperado, caj_diferencia, caj_tot_efectivo,
                    caj_tot_yape, caj_tot_ventas, caj_can_ventas,
                    caj_observacion, caj_id_usu_cierre, caj_solicitud_id, caj_solicitud_id_cierre
                ) VALUES (
                    {0}, {1}, 100.00, NULL,
                    NOW(), NULL, 'Abierta',
                    NOW(), NULL,
                    NULL, NULL, NULL,
                    NULL, NULL, NULL,
                    NULL, NULL, NULL, NULL
                );";

            await context.Database.ExecuteSqlRawAsync(insertSql, legacyCajaId, user.Id_Usuario);

            // Test 1: ObtenerPorIdConDetallesAsync on legacy row with NULLs
            var loadedDetalles = await repo.ObtenerPorIdConDetallesAsync(legacyCajaId);
            Assert.NotNull(loadedDetalles);
            Assert.Equal(legacyCajaId, loadedDetalles!.Id_Caja);
            Assert.Null(loadedDetalles.Caj_SolicitudId);
            Assert.Null(loadedDetalles.Caj_MontoEsperado);
            Assert.Null(loadedDetalles.Caj_Diferencia);
            Assert.Null(loadedDetalles.Id_UsuarioCierre);
            Assert.Null(loadedDetalles.Caj_UsuarioCierre);

            // Test 2: ObtenerHistorialPaginadoAsync including legacy row with NULLs
            var (items, total) = await repo.ObtenerHistorialPaginadoAsync(null, null, 1, 50);
            Assert.True(total > 0);
            var found = items.FirstOrDefault(c => c.Id_Caja == legacyCajaId);
            Assert.NotNull(found);
            Assert.Null(found!.Caj_SolicitudId);
            Assert.Null(found.Caj_MontoEsperado);

            // Test 3: ObtenerPorIdAsync on legacy row
            var loadedSimple = await repo.ObtenerPorIdAsync(legacyCajaId);
            Assert.NotNull(loadedSimple);
            Assert.Null(loadedSimple!.Caj_SolicitudId);
        }
        finally
        {
            await tx.RollbackAsync();
        }
    }

    // =========================================================================
    // DEFECT 2: ObtenerVentasPorCajaIdAsync strictly excludes anuladas sales
    // =========================================================================

    [Fact]
    public async Task Defect2_ObtenerVentasPorCajaIdAsync_Strictly_Filters_Only_Vigente_Sales()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        var caja = new Caja(user.Id_Usuario, 200.00m, "sol-caja-defect2");
        await context.Cajas.AddAsync(caja);

        var mesa = new Mesa("Mesa 5");
        await context.Mesas.AddAsync(mesa);

        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), mesa.Id_Mesa, user.Id_Usuario, "sol-ped-def2");
        await context.Pedidos.AddAsync(pedido);

        // Venta 1: Vigente (S/ 80.00)
        var v1 = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 80.00m, MetodoPago.Efectivo, venSolicitudId: "sol-v1");

        // Venta 2: Anulada (S/ 50.00)
        var v2 = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 50.00m, MetodoPago.Efectivo, venSolicitudId: "sol-v2");
        v2.Anular("Cliente canceló pedido", "cajero1", "Ninguno");

        // Venta 3: Vigente (S/ 120.00)
        var v3 = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 120.00m, MetodoPago.Yape, venSolicitudId: "sol-v3");

        // Venta 4: Anulada (S/ 40.00)
        var v4 = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 40.00m, MetodoPago.Yape, venSolicitudId: "sol-v4");
        v4.Anular("Error de monto", "admin", "Ninguno");

        await context.Ventas.AddRangeAsync(v1, v2, v3, v4);
        await context.SaveChangesAsync();

        // ACT
        var ventas = await repo.ObtenerVentasPorCajaIdAsync(caja.Id_Caja);

        // ASSERT: Must return exactly the 2 vigentes (v1 and v3), never v2 or v4
        Assert.Equal(2, ventas.Count);
        Assert.Contains(ventas, v => v.Id_Venta == v1.Id_Venta && v.Ven_Estado == EstadoVenta.Vigente);
        Assert.Contains(ventas, v => v.Id_Venta == v3.Id_Venta && v.Ven_Estado == EstadoVenta.Vigente);
        Assert.DoesNotContain(ventas, v => v.Id_Venta == v2.Id_Venta);
        Assert.DoesNotContain(ventas, v => v.Id_Venta == v4.Id_Venta);
        Assert.All(ventas, v => Assert.Equal(EstadoVenta.Vigente, v.Ven_Estado));
    }

    [Fact]
    public async Task Defect2_ObtenerVentasPorCajaIdAsync_When_All_Sales_Are_Anuladas_Returns_Empty_List()
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero1");
        await context.Usuarios.AddAsync(user);

        var caja = new Caja(user.Id_Usuario, 200.00m, "sol-caja-anuladas-only");
        await context.Cajas.AddAsync(caja);

        var mesa = new Mesa("Mesa 2");
        await context.Mesas.AddAsync(mesa);

        var pedido = new Pedido(1, DateOnly.FromDateTime(DateTime.Today), mesa.Id_Mesa, user.Id_Usuario, "sol-ped-anuladas");
        await context.Pedidos.AddAsync(pedido);

        var v1 = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 50.00m, MetodoPago.Efectivo, venSolicitudId: "sol-anulada-1");
        v1.Anular("Motivo 1", "cajero1", "Ninguno");

        var v2 = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 75.00m, MetodoPago.Yape, venSolicitudId: "sol-anulada-2");
        v2.Anular("Motivo 2", "cajero1", "Ninguno");

        await context.Ventas.AddRangeAsync(v1, v2);
        await context.SaveChangesAsync();

        // ACT
        var ventas = await repo.ObtenerVentasPorCajaIdAsync(caja.Id_Caja);

        // ASSERT
        Assert.NotNull(ventas);
        Assert.Empty(ventas);
    }

    [Fact]
    public async Task Defect2_Postgres_ObtenerVentasPorCajaIdAsync_Executes_Filter_In_Sql_Engine()
    {
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        await using var tx = await context.Database.BeginTransactionAsync();
        try
        {
            var user = await context.Usuarios.FirstAsync();
            var mesa = await context.Mesas.FirstAsync();

            var caja = new Caja(user.Id_Usuario, 150.00m, "sol-pg-def2");
            await repo.AgregarAsync(caja);

            var pedido = new Pedido(999, DateOnly.FromDateTime(DateTime.Today), mesa.Id_Mesa, user.Id_Usuario, "sol-pg-ped");
            await context.Pedidos.AddAsync(pedido);
            await context.SaveChangesAsync();

            var vVigente = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 60.00m, MetodoPago.Efectivo, venSolicitudId: "pg-v-vig");
            var vAnulada = new Venta(pedido.Id_Pedido, user.Id_Usuario, caja.Id_Caja, 40.00m, MetodoPago.Efectivo, venSolicitudId: "pg-v-anu");
            vAnulada.Anular("Anulada en Postgres", user.Usu_Usuario, "Ninguno");

            await context.Ventas.AddRangeAsync(vVigente, vAnulada);
            await context.SaveChangesAsync();

            // ACT
            var ventas = await repo.ObtenerVentasPorCajaIdAsync(caja.Id_Caja);

            // ASSERT
            Assert.Single(ventas);
            Assert.Equal(vVigente.Id_Venta, ventas[0].Id_Venta);
            Assert.Equal(EstadoVenta.Vigente, ventas[0].Ven_Estado);
        }
        finally
        {
            await tx.RollbackAsync();
        }
    }

    // =========================================================================
    // DEFECT 3: ObtenerHistorialPaginadoAsync with hasta as UTC midnight includes full day
    // =========================================================================

    [Fact]
    public async Task Defect3_ObtenerHistorialPaginadoAsync_Utc_Midnight_Includes_All_Registers_Opened_During_That_Day()
    {
        // TARGET SPECIFICATION:
        // Day under test: 2026-10-18 (Lima time: UTC-5)
        // In Lima, 2026-10-18 spans from 2026-10-18 00:00:00 (05:00:00 UTC) to 2026-10-18 23:59:59.999 (2026-10-19 04:59:59.999 UTC).
        //
        // Client sends: hasta = 2026-10-18T00:00:00.0000000Z (UTC midnight).
        // Requirement: ALL cash registers opened during 2026-10-18 (morning, afternoon, night) MUST be included.
        // Registers opened before 05:00 UTC or after 2026-10-19 05:00 UTC must be excluded.

        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("cajero_hist");
        await context.Usuarios.AddAsync(user);

        // 1. Prior day register (opened at 23:59:59 Lima on 2026-10-17 = 2026-10-18 04:59:59 UTC) -> EXCLUDED
        var cajaAyer = new Caja(user.Id_Usuario, 100.00m, "caja-ayer");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaAyer, new DateTime(2026, 10, 18, 4, 59, 59, DateTimeKind.Utc));

        // 2. Start of today (00:00:00 Lima = 05:00:00 UTC) -> INCLUDED
        var cajaInicioHoy = new Caja(user.Id_Usuario, 110.00m, "caja-inicio-hoy");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaInicioHoy, new DateTime(2026, 10, 18, 5, 0, 0, DateTimeKind.Utc));

        // 3. Morning (08:00 Lima = 13:00 UTC) -> INCLUDED
        var cajaManana = new Caja(user.Id_Usuario, 120.00m, "caja-manana");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaManana, new DateTime(2026, 10, 18, 13, 0, 0, DateTimeKind.Utc));

        // 4. Afternoon (14:30 Lima = 19:30 UTC) -> INCLUDED
        var cajaTarde = new Caja(user.Id_Usuario, 130.00m, "caja-tarde");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaTarde, new DateTime(2026, 10, 18, 19, 30, 0, DateTimeKind.Utc));

        // 5. Late night (23:30 Lima = 2026-10-19 04:30 UTC) -> INCLUDED
        var cajaNoche = new Caja(user.Id_Usuario, 140.00m, "caja-noche");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaNoche, new DateTime(2026, 10, 19, 4, 30, 0, DateTimeKind.Utc));

        // 6. Last boundary second (23:59:59 Lima = 2026-10-19 04:59:59 UTC) -> INCLUDED
        var cajaLimite = new Caja(user.Id_Usuario, 150.00m, "caja-limite-hoy");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaLimite, new DateTime(2026, 10, 19, 4, 59, 59, DateTimeKind.Utc));

        // 7. Next day first second (00:00:00 Lima on 2026-10-19 = 2026-10-19 05:00:00 UTC) -> EXCLUDED
        var cajaMananaSiguiente = new Caja(user.Id_Usuario, 160.00m, "caja-dia-siguiente");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(cajaMananaSiguiente, new DateTime(2026, 10, 19, 5, 0, 0, DateTimeKind.Utc));

        await context.Cajas.AddRangeAsync(cajaAyer, cajaInicioHoy, cajaManana, cajaTarde, cajaNoche, cajaLimite, cajaMananaSiguiente);
        await context.SaveChangesAsync();

        // ACT: Client passes single-day filter where hasta is UTC midnight:
        var desdeUtcMidnight = new DateTime(2026, 10, 18, 0, 0, 0, DateTimeKind.Utc);
        var hastaUtcMidnight = new DateTime(2026, 10, 18, 0, 0, 0, DateTimeKind.Utc);

        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(desdeUtcMidnight, hastaUtcMidnight, 1, 50);

        // ASSERT:
        // Must return exactly 5 registers from 2026-10-18:
        // cajaInicioHoy, cajaManana, cajaTarde, cajaNoche, cajaLimite.
        // MUST NOT contain cajaAyer or cajaMananaSiguiente.
        Assert.Equal(5, total);
        Assert.Equal(5, items.Count);

        Assert.Contains(items, c => c.Id_Caja == cajaInicioHoy.Id_Caja);
        Assert.Contains(items, c => c.Id_Caja == cajaManana.Id_Caja);
        Assert.Contains(items, c => c.Id_Caja == cajaTarde.Id_Caja);
        Assert.Contains(items, c => c.Id_Caja == cajaNoche.Id_Caja);
        Assert.Contains(items, c => c.Id_Caja == cajaLimite.Id_Caja);

        Assert.DoesNotContain(items, c => c.Id_Caja == cajaAyer.Id_Caja);
        Assert.DoesNotContain(items, c => c.Id_Caja == cajaMananaSiguiente.Id_Caja);
    }

    [Theory]
    [InlineData(DateTimeKind.Utc)]
    [InlineData(DateTimeKind.Unspecified)]
    [InlineData(DateTimeKind.Local)]
    public async Task Defect3_ObtenerHistorialPaginadoAsync_Consistent_Across_All_DateTimeKinds(DateTimeKind kind)
    {
        using var context = CreateInMemoryDbContext();
        var repo = new CajaRepository(context);

        var user = CreateTestUser("user1");
        await context.Usuarios.AddAsync(user);

        // Register opened at 15:00 Lima on 2026-10-18 = 20:00 UTC
        var caja = new Caja(user.Id_Usuario, 100.00m, "caja-kinds");
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(caja, new DateTime(2026, 10, 18, 20, 0, 0, DateTimeKind.Utc));

        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        var desde = new DateTime(2026, 10, 18, 0, 0, 0, kind);
        var hasta = new DateTime(2026, 10, 18, 0, 0, 0, kind);

        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(desde, hasta, 1, 10);

        Assert.Equal(1, total);
        Assert.Single(items);
        Assert.Equal(caja.Id_Caja, items[0].Id_Caja);
    }
}
