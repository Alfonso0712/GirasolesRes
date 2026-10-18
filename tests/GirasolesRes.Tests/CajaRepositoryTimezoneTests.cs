using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GirasolesRes.Tests;

public class CajaRepositoryTimezoneTests
{
    private static GirasolesDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new GirasolesDbContext(options);
    }

    private static (Usuario user, Caja caja) CreateTestCaja(DateTime fechaAperturaUtc, EstadoCaja estado = EstadoCaja.Abierta)
    {
        var user = new Usuario(
            usuUsuario: "cajero_test",
            usuNombre: "Cajero Test",
            usuCorreo: "cajero@test.com",
            usuPasswordHash: "hash123",
            usuRol: RolUsuario.Cajero
        );

        var caja = new Caja(user.Id_Usuario, 100.00m, "sol-test-" + Guid.NewGuid());

        // Use reflection to set private fields for time/state simulation
        typeof(Caja).GetProperty(nameof(Caja.Caj_FechaAperturaUtc))!
            .SetValue(caja, fechaAperturaUtc);

        typeof(Caja).GetProperty(nameof(Caja.Caj_Estado))!
            .SetValue(caja, estado);

        return (user, caja);
    }

    [Fact]
    public async Task ObtenerCajaAnteriorSinCerrarAsync_Apertura_23_30_Lima_Ayer_Detectada_A_Las_08_00_Lima_Hoy()
    {
        // ARRANGE:
        // Today in Lima: 2026-10-18
        // Yesterday in Lima: 2026-10-17
        // Register opened at 23:30 Lima time on 2026-10-17.
        // In UTC (UTC-5): 23:30:00 + 5h = 2026-10-18 04:30:00 UTC.
        using var context = CreateInMemoryDbContext();
        var repository = new CajaRepository(context);

        var (user, cajaAyer) = CreateTestCaja(
            fechaAperturaUtc: new DateTime(2026, 10, 18, 4, 30, 0, DateTimeKind.Utc),
            estado: EstadoCaja.Abierta
        );

        await context.Usuarios.AddAsync(user);
        await context.Cajas.AddAsync(cajaAyer);
        await context.SaveChangesAsync();

        // ACT:
        // Evaluated at 08:00 Lima time today (2026-10-18 08:00:00)
        var fechaHoyLima = new DateTime(2026, 10, 18, 8, 0, 0);
        var resultado = await repository.ObtenerCajaAnteriorSinCerrarAsync(fechaHoyLima);

        // ASSERT:
        // The register opened at 23:30 Lima yesterday MUST be detected as an unclosed prior day register
        Assert.NotNull(resultado);
        Assert.Equal(cajaAyer.Id_Caja, resultado!.Id_Caja);
        Assert.Equal(new DateTime(2026, 10, 18, 4, 30, 0, DateTimeKind.Utc), resultado.Caj_FechaAperturaUtc);
    }

    [Fact]
    public async Task ObtenerCajaAnteriorSinCerrarAsync_Boundary_04_59_UTC_Is_Prior_Day()
    {
        // ARRANGE:
        // 04:59:59 UTC = 23:59:59 Lima time yesterday (2026-10-17)
        using var context = CreateInMemoryDbContext();
        var repository = new CajaRepository(context);

        var (user, caja) = CreateTestCaja(
            fechaAperturaUtc: new DateTime(2026, 10, 18, 4, 59, 59, DateTimeKind.Utc),
            estado: EstadoCaja.Abierta
        );

        await context.Usuarios.AddAsync(user);
        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        // ACT:
        var fechaHoyLima = new DateTime(2026, 10, 18, 0, 0, 0);
        var resultado = await repository.ObtenerCajaAnteriorSinCerrarAsync(fechaHoyLima);

        // ASSERT: 04:59:59 UTC < 05:00:00 UTC threshold -> Prior day detected!
        Assert.NotNull(resultado);
        Assert.Equal(caja.Id_Caja, resultado!.Id_Caja);
    }

    [Fact]
    public async Task ObtenerCajaAnteriorSinCerrarAsync_Boundary_05_00_UTC_Is_Today_Not_Prior_Day()
    {
        // ARRANGE:
        // Exactly 05:00:00 UTC = 00:00:00 Lima time today (2026-10-18)
        using var context = CreateInMemoryDbContext();
        var repository = new CajaRepository(context);

        var (user, caja) = CreateTestCaja(
            fechaAperturaUtc: new DateTime(2026, 10, 18, 5, 0, 0, DateTimeKind.Utc),
            estado: EstadoCaja.Abierta
        );

        await context.Usuarios.AddAsync(user);
        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        // ACT:
        var fechaHoyLima = new DateTime(2026, 10, 18, 8, 0, 0);
        var resultado = await repository.ObtenerCajaAnteriorSinCerrarAsync(fechaHoyLima);

        // ASSERT: 05:00:00 UTC is NOT strictly less than 05:00:00 UTC -> NOT prior day!
        Assert.Null(resultado);
    }

    [Fact]
    public async Task ObtenerCajaAnteriorSinCerrarAsync_Boundary_05_01_UTC_Is_Today_Not_Prior_Day()
    {
        // ARRANGE:
        // 05:01:00 UTC = 00:01:00 Lima time today (2026-10-18)
        using var context = CreateInMemoryDbContext();
        var repository = new CajaRepository(context);

        var (user, caja) = CreateTestCaja(
            fechaAperturaUtc: new DateTime(2026, 10, 18, 5, 1, 0, DateTimeKind.Utc),
            estado: EstadoCaja.Abierta
        );

        await context.Usuarios.AddAsync(user);
        await context.Cajas.AddAsync(caja);
        await context.SaveChangesAsync();

        // ACT:
        var fechaHoyLima = new DateTime(2026, 10, 18, 8, 0, 0);
        var resultado = await repository.ObtenerCajaAnteriorSinCerrarAsync(fechaHoyLima);

        // ASSERT: 05:01:00 UTC is today's register -> NOT prior day!
        Assert.Null(resultado);
    }

    [Fact]
    public async Task ObtenerCajaAnteriorSinCerrarAsync_Ignora_Cajas_Cerradas_De_Dias_Anteriores()
    {
        // ARRANGE:
        // Register from yesterday, but it was properly closed.
        using var context = CreateInMemoryDbContext();
        var repository = new CajaRepository(context);

        var (user, cajaCerrada) = CreateTestCaja(
            fechaAperturaUtc: new DateTime(2026, 10, 18, 3, 0, 0, DateTimeKind.Utc), // 22:00 Lima ayer
            estado: EstadoCaja.Cerrada
        );

        await context.Usuarios.AddAsync(user);
        await context.Cajas.AddAsync(cajaCerrada);
        await context.SaveChangesAsync();

        // ACT:
        var fechaHoyLima = new DateTime(2026, 10, 18, 8, 0, 0);
        var resultado = await repository.ObtenerCajaAnteriorSinCerrarAsync(fechaHoyLima);

        // ASSERT:
        Assert.Null(resultado);
    }

    [Fact]
    public async Task ObtenerCajaAnteriorSinCerrarAsync_Retorna_La_Mas_Antigua_Si_Hay_Multiples_Sin_Cerrar()
    {
        // ARRANGE:
        using var context = CreateInMemoryDbContext();
        var repository = new CajaRepository(context);

        var (user, cajaHaceDosDias) = CreateTestCaja(
            fechaAperturaUtc: new DateTime(2026, 10, 16, 15, 0, 0, DateTimeKind.Utc),
            estado: EstadoCaja.Abierta
        );

        var (_, cajaAyer) = CreateTestCaja(
            fechaAperturaUtc: new DateTime(2026, 10, 17, 15, 0, 0, DateTimeKind.Utc),
            estado: EstadoCaja.Abierta
        );

        await context.Usuarios.AddAsync(user);
        await context.Cajas.AddRangeAsync(cajaHaceDosDias, cajaAyer);
        await context.SaveChangesAsync();

        // ACT:
        var fechaHoyLima = new DateTime(2026, 10, 18, 8, 0, 0);
        var resultado = await repository.ObtenerCajaAnteriorSinCerrarAsync(fechaHoyLima);

        // ASSERT: Returns the oldest unclosed register
        Assert.NotNull(resultado);
        Assert.Equal(cajaHaceDosDias.Id_Caja, resultado!.Id_Caja);
    }
}
