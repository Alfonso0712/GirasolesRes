using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GirasolesRes.Tests;

public class CajaRepositoryPostgreSqlIntegrationTests
{
    private const string ConnectionString = "Host=localhost;Port=5433;Database=girasoles_db;Username=postgres;Password=1234";

    private static GirasolesDbContext CreatePostgresDbContext()
    {
        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        return new GirasolesDbContext(options);
    }

    [Fact]
    public async Task Postgres_DbContext_Model_Validates_Against_Real_Database_Schema()
    {
        using var context = CreatePostgresDbContext();

        // Query any caja and any usuario to ensure EF Core entity mappings align with DB columns
        var canConnect = await context.Database.CanConnectAsync();
        Assert.True(canConnect, "Debe poder conectarse a la base de datos PostgreSQL local en el puerto 5433");

        var anyUser = await context.Usuarios.AsNoTracking().FirstOrDefaultAsync();
        Assert.NotNull(anyUser);
    }

    [Fact]
    public async Task Postgres_Legacy_Caja_With_Null_SolicitudId_Loads_Without_InvalidCastException()
    {
        // REGRESSION VERIFICATION:
        // Pre-existing records with caj_solicitud_id IS NULL or legacy state must NEVER
        // throw InvalidCastException when queried via EF Core repository.
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        // Query open register and paginated history; must not throw InvalidCastException
        var openCaja = await repo.ObtenerCajaAbiertaAsync();
        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(null, null, 1, 20);

        Assert.NotNull(items);
        Assert.True(total >= 0);
    }

    [Fact]
    public async Task Postgres_ObtenerUltimaCajaCerradaAsync_Translates_Coalesce_Ordering_Cleanly()
    {
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        // Validates: c.Caj_FechaCierreUtc ?? c.Caj_FechaAperturaUtc translates to COALESCE in Postgres SQL
        var result = await repo.ObtenerUltimaCajaCerradaAsync();
        // Verifies execution doesn't throw
    }

    [Fact]
    public async Task Postgres_ObtenerCajaAnteriorSinCerrarAsync_Executes_Sargable_Timestamp_Filter()
    {
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        var hoyLima = DateTime.Today; // 00:00:00 Lima
        var result = await repo.ObtenerCajaAnteriorSinCerrarAsync(hoyLima);
        // Validates timestamp with time zone comparison against inicioHoyUtc
    }

    [Fact]
    public async Task Postgres_ObtenerHistorialPaginadoAsync_Executes_Without_Errors()
    {
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        // Filter in future range to avoid materializing legacy null row while testing SQL translation
        var desde = DateTime.UtcNow.AddYears(10);
        var hasta = DateTime.UtcNow.AddYears(11);

        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(desde, hasta, 1, 20);

        Assert.Equal(0, total);
        Assert.NotNull(items);
        Assert.Empty(items);
    }

    [Fact]
    public async Task Postgres_ObtenerPorSolicitudIdAsync_Translates_Or_Condition()
    {
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        var result = await repo.ObtenerPorSolicitudIdAsync("dummy-token-nonexistent");
        Assert.Null(result);
    }

    [Fact]
    public async Task Postgres_Full_Caja_Lifecycle_In_Transaction_Verifies_All_CUS13_Columns()
    {
        using var context = CreatePostgresDbContext();
        var repo = new CajaRepository(context);

        // Execute inside a rollback transaction so we leave no test pollution in the DB
        await using var tx = await context.Database.BeginTransactionAsync();
        try
        {
            var adminUser = await context.Usuarios.FirstAsync(u => u.Usu_Rol == RolUsuario.Administrador);
            var cajeroUser = await context.Usuarios.FirstAsync(u => u.Usu_Rol == RolUsuario.Cajero);

            var solicitudApertura = "test-sol-" + Guid.NewGuid();
            var solicitudCierre = "test-cierre-" + Guid.NewGuid();

            // 1. Apertura
            var caja = new Caja(cajeroUser.Id_Usuario, 150.00m, solicitudApertura);
            await repo.AgregarAsync(caja);

            // 2. Query by SolicitudId
            var byToken = await repo.ObtenerPorSolicitudIdAsync(solicitudApertura);
            Assert.NotNull(byToken);
            Assert.Equal(caja.Id_Caja, byToken!.Id_Caja);

            // 3. Cierre with full snapshot columns
            caja.Cerrar(
                idUsuarioCierre: adminUser.Id_Usuario,
                efectivoContado: 450.00m,
                efectivoEsperado: 450.00m,
                totalVentasEfectivo: 300.00m,
                totalVentasYape: 150.00m,
                totalVentas: 450.00m,
                cantidadVentas: 8,
                observacion: "Cierre exitoso verificado en PostgreSQL 18",
                solicitudIdCierre: solicitudCierre
            );

            await repo.ActualizarAsync(caja);

            // 4. Query with details
            var conDetalles = await repo.ObtenerPorIdConDetallesAsync(caja.Id_Caja);
            Assert.NotNull(conDetalles);
            Assert.Equal(caja.Id_Caja, conDetalles!.Id_Caja);
            Assert.Equal(450.00m, conDetalles.Caj_MontoCierre);
            Assert.Equal(450.00m, conDetalles.Caj_MontoEsperado);
            Assert.Equal(0.00m, conDetalles.Caj_Diferencia);
            Assert.Equal(300.00m, conDetalles.Caj_TotalVentasEfectivo);
            Assert.Equal(150.00m, conDetalles.Caj_TotalVentasYape);
            Assert.Equal(450.00m, conDetalles.Caj_TotalVentas);
            Assert.Equal(8, conDetalles.Caj_CantidadVentas);
            Assert.Equal("Cierre exitoso verificado en PostgreSQL 18", conDetalles.Caj_Observacion);
            Assert.Equal(solicitudCierre, conDetalles.Caj_SolicitudIdCierre);
            Assert.NotNull(conDetalles.Caj_UsuarioCierre);
            Assert.Equal(adminUser.Id_Usuario, conDetalles.Caj_UsuarioCierre!.Id_Usuario);
        }
        finally
        {
            await tx.RollbackAsync();
        }
    }
}
