using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Domain.Exceptions;
using GirasolesRes.Infrastructure.Data;
using GirasolesRes.Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AuditM1Runner;

class Program
{
    static int passedCount = 0;
    static int failedCount = 0;

    static async Task<int> Main(string[] args)
    {
        Console.WriteLine("======================================================================");
        Console.WriteLine("FORENSIC AUDITOR INDEPENDENT VERIFICATION RUNNER - MILESTONE 1");
        Console.WriteLine("======================================================================");

        RunDomainEntityTests();
        RunDomainExceptionsTests();
        await RunEfCoreAndRepositoryTests();

        Console.WriteLine("======================================================================");
        Console.WriteLine($"RESULTS: {passedCount} PASSED, {failedCount} FAILED");
        Console.WriteLine("======================================================================");

        return failedCount == 0 ? 0 : 1;
    }

    static void Assert(bool condition, string testName, string details = "")
    {
        if (condition)
        {
            Console.WriteLine($"[PASS] {testName} {details}");
            passedCount++;
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"[FAIL] {testName} {details}");
            Console.ResetColor();
            failedCount++;
        }
    }

    static void RunDomainEntityTests()
    {
        Console.WriteLine("\n--- SECTION 1: DOMAIN ENTITY (Caja.cs) INVARIANTS ---");
        var userId = Guid.NewGuid();

        // T1.1: Lower bound 0.00
        var c1 = new Caja(userId, 0.00m, "sol-001");
        Assert(c1.Caj_MontoApertura == 0.00m && c1.Caj_Estado == EstadoCaja.Abierta, "T1.1: Monto inicial 0.00m permitido");

        // T1.2: Upper bound 99999.99
        var c2 = new Caja(userId, 99999.99m, "sol-002");
        Assert(c2.Caj_MontoApertura == 99999.99m, "T1.2: Monto inicial 99999.99m permitido");

        // T1.3: Normal amount 150.50
        var c3 = new Caja(userId, 150.50m);
        Assert(c3.Caj_MontoApertura == 150.50m && !string.IsNullOrWhiteSpace(c3.Caj_SolicitudId), "T1.3: Monto inicial normal y autogeneración de SolicitudId");

        // T1.4: Negative amount throws
        bool threwNegative = false;
        try { new Caja(userId, -0.01m); }
        catch (CajaMontoInvalidoException) { threwNegative = true; }
        Assert(threwNegative, "T1.4: Monto negativo rechaza con CajaMontoInvalidoException");

        // T1.5: Amount > 99999.99 throws
        bool threwMax = false;
        try { new Caja(userId, 100000.00m); }
        catch (CajaMontoInvalidoException) { threwMax = true; }
        Assert(threwMax, "T1.5: Monto > 99999.99 rechaza con CajaMontoInvalidoException");

        // T1.6: Decimals > 2 throws
        bool threwDecimals = false;
        try { new Caja(userId, 50.125m); }
        catch (CajaMontoInvalidoException) { threwDecimals = true; }
        Assert(threwDecimals, "T1.6: Monto con > 2 decimales rechaza con CajaMontoInvalidoException");

        // T1.7: Empty user Guid throws
        bool threwEmptyUser = false;
        try { new Caja(Guid.Empty, 50.00m); }
        catch (ArgumentException) { threwEmptyUser = true; }
        Assert(threwEmptyUser, "T1.7: Usuario apertura Guid.Empty rechaza con ArgumentException");

        // T1.8: SolicitudId trimming
        var c4 = new Caja(userId, 50.00m, "   sol-trimmed   ");
        Assert(c4.Caj_SolicitudId == "sol-trimmed", "T1.8: SolicitudId whitespace trimmed");

        // T1.9: Timestamps UTC
        Assert(c4.Caj_FechaAperturaUtc.Kind == DateTimeKind.Utc && (DateTime.UtcNow - c4.Caj_FechaAperturaUtc).TotalSeconds < 5, "T1.9: FechaAperturaUtc es Utc y reciente");

        Console.WriteLine("\n--- SECTION 2: DOMAIN CIERRE & CUADRE INVARIANTS ---");
        var userCierreId = Guid.NewGuid();

        // T2.1: Exact cuadre (diferencia == 0.00)
        var cajaCuadra = new Caja(userId, 100.00m);
        cajaCuadra.Cerrar(userCierreId, efectivoContado: 250.00m, efectivoEsperado: 250.00m,
            totalVentasEfectivo: 150.00m, totalVentasYape: 50.00m, totalVentas: 200.00m,
            cantidadVentas: 4, observacion: "Cuadre exacto", solicitudIdCierre: "cierre-001");
        Assert(cajaCuadra.Caj_Estado == EstadoCaja.Cerrada &&
               cajaCuadra.Caj_Diferencia == 0.00m &&
               cajaCuadra.ObtenerEstadoCuadre() == EstadoCuadre.Cuadra,
               "T2.1: Cierre exacto -> Diferencia 0.00 y EstadoCuadre.Cuadra");

        // T2.2: Sobrante (contado > esperado)
        var cajaSobrante = new Caja(userId, 100.00m);
        cajaSobrante.Cerrar(userCierreId, efectivoContado: 260.00m, efectivoEsperado: 250.00m,
            totalVentasEfectivo: 150.00m, totalVentasYape: 50.00m, totalVentas: 200.00m, cantidadVentas: 4);
        Assert(cajaSobrante.Caj_Diferencia == 10.00m &&
               cajaSobrante.ObtenerEstadoCuadre() == EstadoCuadre.Sobrante,
               "T2.2: Cierre sobrante -> Diferencia +10.00 y EstadoCuadre.Sobrante");

        // T2.3: Faltante (contado < esperado)
        var cajaFaltante = new Caja(userId, 100.00m);
        cajaFaltante.Cerrar(userCierreId, efectivoContado: 240.00m, efectivoEsperado: 250.00m,
            totalVentasEfectivo: 150.00m, totalVentasYape: 50.00m, totalVentas: 200.00m, cantidadVentas: 4);
        Assert(cajaFaltante.Caj_Diferencia == -10.00m &&
               cajaFaltante.ObtenerEstadoCuadre() == EstadoCuadre.Faltante,
               "T2.3: Cierre faltante -> Diferencia -10.00 y EstadoCuadre.Faltante");

        // T2.4: Inmutabilidad: re-cierre lanza CajaYaCerradaException
        bool threwReCierre = false;
        try
        {
            cajaCuadra.Cerrar(userCierreId, 250.00m, 250.00m, 150.00m, 50.00m, 200.00m, 4);
        }
        catch (CajaYaCerradaException ex)
        {
            threwReCierre = ex.CajaId == cajaCuadra.Id_Caja && ex.Codigo == "caja_ya_cerrada";
        }
        Assert(threwReCierre, "T2.4: Intento de doble cierre lanza CajaYaCerradaException");

        // T2.5: Usuario de cierre Guid.Empty
        var cTestUser = new Caja(userId, 50.00m);
        bool threwEmptyUserCierre = false;
        try { cTestUser.Cerrar(Guid.Empty, 50.00m, 50.00m, 0m, 0m, 0m, 0); }
        catch (ArgumentException) { threwEmptyUserCierre = true; }
        Assert(threwEmptyUserCierre, "T2.5: Usuario cierre Guid.Empty lanza ArgumentException");

        // T2.6: Efectivo contado negativo
        var cTestNeg = new Caja(userId, 50.00m);
        bool threwContadoNeg = false;
        try { cTestNeg.Cerrar(userCierreId, -0.01m, 50.00m, 0m, 0m, 0m, 0); }
        catch (CajaMontoInvalidoException) { threwContadoNeg = true; }
        Assert(threwContadoNeg, "T2.6: Efectivo contado negativo lanza CajaMontoInvalidoException");

        // T2.7: Efectivo contado > 99999.99
        var cTestMax = new Caja(userId, 50.00m);
        bool threwContadoMax = false;
        try { cTestMax.Cerrar(userCierreId, 100000.00m, 50.00m, 0m, 0m, 0m, 0); }
        catch (CajaMontoInvalidoException) { threwContadoMax = true; }
        Assert(threwContadoMax, "T2.7: Efectivo contado > 99999.99 lanza CajaMontoInvalidoException");

        // T2.8: Efectivo contado con > 2 decimales
        var cTestDec = new Caja(userId, 50.00m);
        bool threwContadoDec = false;
        try { cTestDec.Cerrar(userCierreId, 50.001m, 50.00m, 0m, 0m, 0m, 0); }
        catch (CajaMontoInvalidoException) { threwContadoDec = true; }
        Assert(threwContadoDec, "T2.8: Efectivo contado con > 2 decimales lanza CajaMontoInvalidoException");

        // T2.9: Observacion <= 200 caracteres
        var cTestObsValid = new Caja(userId, 50.00m);
        string obs200 = new string('A', 200);
        cTestObsValid.Cerrar(userCierreId, 50.00m, 50.00m, 0m, 0m, 0m, 0, observacion: obs200);
        Assert(cTestObsValid.Caj_Observacion == obs200, "T2.9: Observación de exactamente 200 caracteres es válida");

        // T2.10: Observacion > 200 caracteres lanza
        var cTestObsInvalid = new Caja(userId, 50.00m);
        string obs201 = new string('B', 201);
        bool threwObsInvalid = false;
        try { cTestObsInvalid.Cerrar(userCierreId, 50.00m, 50.00m, 0m, 0m, 0m, 0, observacion: obs201); }
        catch (CajaObservacionInvalidaException ex)
        {
            threwObsInvalid = ex.LongitudActual == 201 && ex.LongitudMaxima == 200 && ex.Codigo == "observacion_invalida";
        }
        Assert(threwObsInvalid, "T2.10: Observación de 201 caracteres lanza CajaObservacionInvalidaException");

        // T2.11: Observacion whitespace becomes null
        var cTestObsWs = new Caja(userId, 50.00m);
        cTestObsWs.Cerrar(userCierreId, 50.00m, 50.00m, 0m, 0m, 0m, 0, observacion: "   ");
        Assert(cTestObsWs.Caj_Observacion == null, "T2.11: Observación de solo espacios se normaliza a null");

        // T2.12: Snapshot verification
        Assert(cajaCuadra.Caj_TotalVentasEfectivo == 150.00m &&
               cajaCuadra.Caj_TotalVentasYape == 50.00m &&
               cajaCuadra.Caj_TotalVentas == 200.00m &&
               cajaCuadra.Caj_CantidadVentas == 4 &&
               cajaCuadra.Caj_FechaCierreUtc.HasValue &&
               cajaCuadra.Caj_SolicitudIdCierre == "cierre-001",
               "T2.12: Todos los campos del snapshot de cierre son preservados íntegramente");
    }

    static void RunDomainExceptionsTests()
    {
        Console.WriteLine("\n--- SECTION 3: DOMAIN EXCEPTIONS HIERARCHY & CODES ---");

        var ex1 = new CajaNoAbiertaException();
        Assert(ex1.Codigo == "caja_no_abierta" && ex1 is CajaDomainException, "T3.1: CajaNoAbiertaException");

        var ex2 = new CajaYaAbiertaException("msg", Guid.NewGuid(), DateTime.UtcNow, "cajero");
        Assert(ex2.Codigo == "caja_ya_abierta" && ex2 is CajaDomainException, "T3.2: CajaYaAbiertaException");

        var ex3 = new CajaAnteriorSinCerrarException(Guid.NewGuid(), DateTime.UtcNow, "17/10/2026");
        Assert(ex3.Codigo == "caja_anterior_sin_cerrar" && ex3 is CajaDomainException, "T3.3: CajaAnteriorSinCerrarException");

        var ex4 = new CajaConcurrenciaException(450.00m, 400.00m);
        Assert(ex4.Codigo == "caja_concurrencia" && ex4 is CajaDomainException, "T3.4: CajaConcurrenciaException");

        var ex5 = new CajaPedidosPendientesException(3);
        Assert(ex5.Codigo == "pedidos_pendientes" && ex5.CantidadPedidosPendientes == 3 && ex5 is CajaDomainException, "T3.5: CajaPedidosPendientesException");

        var ex6 = new CajaMontoInvalidoException(-5m, "MontoApertura");
        Assert(ex6.Codigo == "monto_invalido" && ex6 is CajaDomainException, "T3.6: CajaMontoInvalidoException");

        var ex7 = new CajaObservacionInvalidaException(205);
        Assert(ex7.Codigo == "observacion_invalida" && ex7 is CajaDomainException, "T3.7: CajaObservacionInvalidaException");

        var ex8 = new CajaYaCerradaException(Guid.NewGuid());
        Assert(ex8.Codigo == "caja_ya_cerrada" && ex8 is CajaDomainException, "T3.8: CajaYaCerradaException");
    }

    static async Task RunEfCoreAndRepositoryTests()
    {
        Console.WriteLine("\n--- SECTION 4: EF CORE METADATA & REPOSITORY PERSISTENCE ---");

        var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<GirasolesDbContext>()
            .UseSqlite(connection)
            .Options;

        using var context = new GirasolesDbContext(options);
        await context.Database.EnsureCreatedAsync();

        // T4.1: Model metadata check
        var cajaEntityType = context.Model.FindEntityType(typeof(Caja));
        Assert(cajaEntityType != null, "T4.1: EntityType Caja está registrado en el modelo de GirasolesDbContext");
        Assert(cajaEntityType?.GetTableName() == "cajas", "T4.2: Nombre de tabla mapeado es 'cajas'");

        // Check required column mappings in metadata
        var expectedCols = new[]
        {
            "id_caja", "id_usuario", "caj_monto_apertura", "caj_monto_cierre",
            "caj_fec_apertura_utc", "caj_fec_cierre_utc", "caj_estado",
            "fec_creacion_utc", "fec_actualizacion_utc", "caj_mon_esperado",
            "caj_diferencia", "caj_tot_efectivo", "caj_tot_yape", "caj_tot_ventas",
            "caj_can_ventas", "caj_observacion", "caj_id_usu_cierre",
            "caj_solicitud_id", "caj_solicitud_id_cierre"
        };

        var mappedCols = cajaEntityType!.GetProperties()
            .Select(p => p.GetColumnName())
            .ToHashSet();

        bool allColsMapped = expectedCols.All(c => mappedCols.Contains(c));
        Assert(allColsMapped, "T4.3: Todas las 19 columnas de CUS 13 están mapeadas con nombres exactos en EF Core");

        // Seed a test user
        var user = new Usuario("cajero_test", "Cajero Test", "cajero@test.com", "hash", RolUsuario.Cajero, true);
        await context.Usuarios.AddAsync(user);
        await context.SaveChangesAsync();

        var repo = new CajaRepository(context);

        // T4.4: AgregarAsync persistencia
        var caja1 = new Caja(user.Id_Usuario, 150.00m, "sol-test-01");
        await repo.AgregarAsync(caja1);

        var abierta = await repo.ObtenerCajaAbiertaAsync();
        Assert(abierta != null && abierta.Id_Caja == caja1.Id_Caja && abierta.Caj_MontoApertura == 150.00m,
            "T4.4: AgregarAsync y ObtenerCajaAbiertaAsync persisten y recuperan la caja abierta");

        // T4.5: ObtenerPorSolicitudIdAsync
        var porToken = await repo.ObtenerPorSolicitudIdAsync("sol-test-01");
        Assert(porToken != null && porToken.Id_Caja == caja1.Id_Caja, "T4.5: ObtenerPorSolicitudIdAsync recupera caja por token");

        // T4.6: ActualizarAsync y ObtenerUltimaCajaCerradaAsync
        caja1.Cerrar(user.Id_Usuario, efectivoContado: 350.00m, efectivoEsperado: 350.00m,
            totalVentasEfectivo: 200.00m, totalVentasYape: 0m, totalVentas: 200.00m,
            cantidadVentas: 2, observacion: "Cierre exitoso", solicitudIdCierre: "cierre-test-01");
        await repo.ActualizarAsync(caja1);

        var abiertaDespues = await repo.ObtenerCajaAbiertaAsync();
        Assert(abiertaDespues == null, "T4.6: Tras ActualizarAsync (cierre), ya no hay caja abierta");

        var ultimaCerrada = await repo.ObtenerUltimaCajaCerradaAsync();
        Assert(ultimaCerrada != null && ultimaCerrada.Caj_MontoCierre == 350.00m,
            "T4.7: ObtenerUltimaCajaCerradaAsync retorna la caja cerrada con su monto contado (350.00m)");

        // T4.8: Paginación de historial
        var (items, total) = await repo.ObtenerHistorialPaginadoAsync(null, null, 1, 20);
        Assert(total == 1 && items.Count == 1 && items[0].Id_Caja == caja1.Id_Caja,
            "T4.8: ObtenerHistorialPaginadoAsync pagina correctamente y retorna total exacto");

        // T4.9: Detección de caja de día anterior sin cerrar
        // Creamos una caja abierta con fecha de apertura de ayer
        var cajaAyer = new Caja(user.Id_Usuario, 100.00m, "sol-ayer-01");
        // Forzamos fecha de apertura a 2 días atrás usando reflection para simular caja dejada abierta
        typeof(Caja).GetProperty("Caj_FechaAperturaUtc")!
            .SetValue(cajaAyer, DateTime.UtcNow.AddDays(-2));
        await repo.AgregarAsync(cajaAyer);

        var hoyLima = DateTime.UtcNow.AddHours(-5);
        var anteriorSinCerrar = await repo.ObtenerCajaAnteriorSinCerrarAsync(hoyLima);
        Assert(anteriorSinCerrar != null && anteriorSinCerrar.Id_Caja == cajaAyer.Id_Caja,
            "T4.9: ObtenerCajaAnteriorSinCerrarAsync detecta fielmente caja de fecha anterior sin cerrar");
    }
}
