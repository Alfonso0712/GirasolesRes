using GirasolesRes.Application.Common;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Domain.Exceptions;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class CajaRepository : ICajaRepository
{
    private readonly GirasolesDbContext _context;

    public CajaRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<Caja?> ObtenerCajaAbiertaAsync(CancellationToken ct = default)
    {
        return await _context.Cajas
            .Include(c => c.Caj_Usuario)
            .Include(c => c.Caj_UsuarioCierre)
            .OrderByDescending(c => c.Caj_FechaAperturaUtc)
            .FirstOrDefaultAsync(c => c.Caj_Estado == EstadoCaja.Abierta, ct);
    }

    /// <inheritdoc />
    public Task<Caja?> ObtenerCajaAbiertaActualAsync(CancellationToken ct = default)
    {
        return ObtenerCajaAbiertaAsync(ct);
    }

    /// <inheritdoc />
    public async Task<Caja?> ObtenerUltimaCajaCerradaAsync(CancellationToken ct = default)
    {
        return await _context.Cajas
            .AsNoTracking()
            .Include(c => c.Caj_Usuario)
            .Include(c => c.Caj_UsuarioCierre)
            .Where(c => c.Caj_Estado == EstadoCaja.Cerrada)
            .OrderByDescending(c => c.Caj_FechaCierreUtc ?? c.Caj_FechaAperturaUtc)
            .FirstOrDefaultAsync(ct);
    }

    /// <inheritdoc />
    public async Task<Caja?> ObtenerCajaAnteriorSinCerrarAsync(DateTime fechaHoyLima, CancellationToken ct = default)
    {
        // 1. Obtener la medianoche de hoy en horario de Lima (00:00:00)
        var inicioHoyLima = fechaHoyLima.Date;

        // 2. Convertir la medianoche de Lima a UTC.
        // Como Perú tiene huso horario constante UTC-5 (sin horario de verano):
        // 00:00:00 en Lima equivale exactamente a 05:00:00 UTC del mismo día calendario.
        var inicioHoyUtc = DateTime.SpecifyKind(inicioHoyLima.AddHours(5), DateTimeKind.Utc);

        // 3. Consultar caja en estado Abierta cuya fecha de apertura sea anterior al umbral de hoy.
        return await _context.Cajas
            .Include(c => c.Caj_Usuario)
            .Include(c => c.Caj_UsuarioCierre)
            .Where(c => c.Caj_Estado == EstadoCaja.Abierta && c.Caj_FechaAperturaUtc < inicioHoyUtc)
            .OrderBy(c => c.Caj_FechaAperturaUtc)
            .FirstOrDefaultAsync(ct);
    }

    /// <inheritdoc />
    public async Task<Caja?> ObtenerPorIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Cajas
            .AsNoTracking()
            .Include(c => c.Caj_Usuario)
            .Include(c => c.Caj_UsuarioCierre)
            .FirstOrDefaultAsync(c => c.Id_Caja == id, ct);
    }

    /// <inheritdoc />
    public async Task<Caja?> ObtenerPorIdConDetallesAsync(Guid id, CancellationToken ct = default)
    {
        // Se utiliza AsSplitQuery para evitar producto cartesiano al incluir ventas y sus detalles
        return await _context.Cajas
            .AsNoTracking()
            .AsSplitQuery()
            .Include(c => c.Caj_Usuario)
            .Include(c => c.Caj_UsuarioCierre)
            .Include(c => c.Caj_Ventas)
                .ThenInclude(v => v.Ven_Pedido)
                    .ThenInclude(p => p!.Ped_Detalles)
                        .ThenInclude(d => d.Det_Producto)
            .Include(c => c.Caj_Ventas)
                .ThenInclude(v => v.Ven_Pedido)
                    .ThenInclude(p => p!.Ped_Detalles)
                        .ThenInclude(d => d.Det_Opciones)
            .Include(c => c.Caj_Ventas)
                .ThenInclude(v => v.Ven_Pedido)
                    .ThenInclude(p => p!.Ped_Detalles)
                        .ThenInclude(d => d.Det_MenuCompleto)
            .Include(c => c.Caj_Ventas)
                .ThenInclude(v => v.Ven_Pedido)
                    .ThenInclude(p => p!.Ped_Mesa)
            .Include(c => c.Caj_Ventas)
                .ThenInclude(v => v.Ven_Comprobante)
            .Include(c => c.Caj_Ventas)
                .ThenInclude(v => v.Ven_Usuario)
            .FirstOrDefaultAsync(c => c.Id_Caja == id, ct);
    }

    /// <inheritdoc />
    public async Task<Caja?> ObtenerPorSolicitudIdAsync(string solicitudId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(solicitudId)) return null;

        var solTrim = solicitudId.Trim();
        return await _context.Cajas
            .Include(c => c.Caj_Usuario)
            .Include(c => c.Caj_UsuarioCierre)
            .FirstOrDefaultAsync(c => c.Caj_SolicitudId == solTrim || c.Caj_SolicitudIdCierre == solTrim, ct);
    }

    /// <inheritdoc />
    public async Task<(List<Caja> Items, int Total)> ObtenerHistorialPaginadoAsync(
        DateTime? desde,
        DateTime? hasta,
        int pagina,
        int tamano,
        CancellationToken ct = default)
    {
        // 1. Normalización sargable de filtros temporales a UTC en huso horario de Lima (UTC-5)
        // Los parámetros representan fechas calendario del historial (p. ej. "2026-10-18").
        // En Perú (UTC-5 constante sin horario de verano):
        // - El inicio del día (00:00:00 Lima) equivale a las 05:00:00 UTC del mismo día calendario.
        // - El fin del día (23:59:59.999... Lima) es estrictamente menor a las 05:00:00 UTC del día siguiente.
        DateTime? desdeUtc = null;
        if (desde.HasValue)
        {
            var fechaDesdeLima = desde.Value.Date;
            desdeUtc = DateTime.SpecifyKind(fechaDesdeLima.AddHours(5), DateTimeKind.Utc);
        }

        DateTime? hastaExclusivoUtc = null;
        if (hasta.HasValue)
        {
            var fechaHastaLima = hasta.Value.Date;
            hastaExclusivoUtc = DateTime.SpecifyKind(fechaHastaLima.AddDays(1).AddHours(5), DateTimeKind.Utc);
        }

        // 2. Armado de consulta con AsNoTracking para máxima eficiencia
        var query = _context.Cajas
            .AsNoTracking()
            .Include(c => c.Caj_Usuario)
            .Include(c => c.Caj_UsuarioCierre)
            .Include(c => c.Caj_Ventas) // Necesario para detectar "Con ajustes" (RV-131, RN-113)
            .AsQueryable();

        // 3. Filtrado por rango temporal de apertura
        if (desdeUtc.HasValue)
        {
            query = query.Where(c => c.Caj_FechaAperturaUtc >= desdeUtc.Value);
        }

        if (hastaExclusivoUtc.HasValue)
        {
            query = query.Where(c => c.Caj_FechaAperturaUtc < hastaExclusivoUtc.Value);
        }

        // 4. Conteo total de elementos que cumplen el criterio
        var total = await query.CountAsync(ct);

        // 5. Paginación y orden cronológico descendente
        // La caja abierta más reciente encabeza el listado de forma natural (RV-130, E-320)
        var items = await query
            .OrderByDescending(c => c.Caj_FechaAperturaUtc)
            .Skip(pagina < 1 ? 0 : (pagina - 1) * (tamano < 1 ? 20 : tamano))
            .Take(tamano < 1 ? 20 : tamano)
            .ToListAsync(ct);

        return (items, total);
    }

    /// <inheritdoc />
    public async Task AgregarAsync(Caja caja, CancellationToken ct = default)
    {
        try
        {
            await _context.Cajas.AddAsync(caja, ct);
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsUniqueIndexViolation(ex))
        {
            _context.Entry(caja).State = EntityState.Detached;
            var cajaAbierta = await _context.Cajas
                .AsNoTracking()
                .Include(c => c.Caj_Usuario)
                .OrderByDescending(c => c.Caj_FechaAperturaUtc)
                .FirstOrDefaultAsync(c => c.Caj_Estado == EstadoCaja.Abierta, ct);

            throw new CajaYaAbiertaException(
                MensajesCatalogo.MSG_167,
                cajaAbierta?.Id_Caja,
                cajaAbierta?.Caj_FechaAperturaUtc,
                cajaAbierta?.Caj_Usuario?.Usu_Nombre
            );
        }
    }

    /// <inheritdoc />
    public async Task ActualizarAsync(Caja caja, CancellationToken ct = default)
    {
        try
        {
            _context.Cajas.Update(caja);
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            _context.Entry(caja).State = EntityState.Detached;
            throw new CajaYaCerradaException(caja.Id_Caja, MensajesCatalogo.MSG_183);
        }
    }

    private static bool IsUniqueIndexViolation(DbUpdateException ex)
    {
        if (ex.InnerException is Npgsql.PostgresException pgEx)
        {
            return pgEx.SqlState == "23505" || pgEx.ConstraintName == "uq_cajas_solo_una_abierta";
        }
        return ex.InnerException?.Message.Contains("23505") == true
            || ex.InnerException?.Message.Contains("uq_cajas_solo_una_abierta") == true
            || ex.Message.Contains("23505")
            || ex.Message.Contains("uq_cajas_solo_una_abierta");
    }

    /// <inheritdoc />
    public async Task<List<Venta>> ObtenerVentasPorCajaIdAsync(Guid cajaId, CancellationToken ct = default)
    {
        return await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Detalles)
                    .ThenInclude(d => d.Det_Producto)
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Detalles)
                    .ThenInclude(d => d.Det_Opciones)
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Detalles)
                    .ThenInclude(d => d.Det_MenuCompleto)
            .Include(v => v.Ven_Comprobante)
            .Where(v => v.Id_Caja == cajaId && v.Ven_Estado == EstadoVenta.Vigente)
            .ToListAsync(ct);
    }
}
