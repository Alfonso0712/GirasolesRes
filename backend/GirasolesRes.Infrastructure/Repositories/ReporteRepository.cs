using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Reportes;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class ReporteRepository : IReporteRepository
{
    private readonly GirasolesDbContext _context;

    public ReporteRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<ReporteVentasResponseDto> ObtenerReporteVentasAsync(DateOnly desde, DateOnly hasta, CancellationToken ct = default)
    {
        var desdeUtc = DateTime.SpecifyKind(desde.ToDateTime(TimeOnly.MinValue).AddHours(5), DateTimeKind.Utc);
        var hastaUtc = DateTime.SpecifyKind(hasta.ToDateTime(TimeOnly.MaxValue).AddHours(5), DateTimeKind.Utc);

        var ventas = await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Ven_Caja)
            .Where(v => v.Ven_FechaHoraUtc >= desdeUtc && v.Ven_FechaHoraUtc <= hastaUtc)
            .ToListAsync(ct);

        var vigentes = ventas.Where(v => v.Ven_Estado == EstadoVenta.Vigente).ToList();
        var anuladas = ventas.Where(v => v.Ven_Estado == EstadoVenta.Anulada).ToList();

        var nVentas = vigentes.Count;
        var total = decimal.Round(vigentes.Sum(v => v.Ven_Total), 2);
        var efectivo = decimal.Round(vigentes.Where(v => v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total), 2);
        var yape = decimal.Round(vigentes.Where(v => v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total), 2);

        var anuladasResumen = new VentasAnuladasResumenDto(
            Cantidad: anuladas.Count,
            Monto: decimal.Round(anuladas.Sum(v => v.Ven_Total), 2)
        );

        var porDiaDict = new Dictionary<DateOnly, (List<Venta> Vigentes, List<Venta> Anuladas)>();

        foreach (var v in ventas)
        {
            var fechaLocal = TimeZoneHelper.GetFechaOperativa(v.Ven_FechaHoraUtc);
            if (!porDiaDict.TryGetValue(fechaLocal, out var lists))
            {
                lists = (new List<Venta>(), new List<Venta>());
                porDiaDict[fechaLocal] = lists;
            }

            if (v.Ven_Estado == EstadoVenta.Vigente)
                lists.Vigentes.Add(v);
            else if (v.Ven_Estado == EstadoVenta.Anulada)
                lists.Anuladas.Add(v);
        }

        var porDia = porDiaDict.Keys
            .OrderBy(k => k)
            .Select(dia =>
            {
                var lists = porDiaDict[dia];
                var diaVigentes = lists.Vigentes;
                var diaAnuladas = lists.Anuladas;

                // RV-137 / RN-121: Marcar "conAjustes" si hubo ventas anuladas asociadas a una caja cerrada
                var conAjustes = diaAnuladas.Any(a => a.Ven_Caja != null && a.Ven_Caja.Caj_Estado == EstadoCaja.Cerrada);

                return new VentaPorDiaDto(
                    Fecha: dia.ToString("yyyy-MM-dd"),
                    NVentas: diaVigentes.Count,
                    Efectivo: decimal.Round(diaVigentes.Where(v => v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total), 2),
                    Yape: decimal.Round(diaVigentes.Where(v => v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total), 2),
                    Total: decimal.Round(diaVigentes.Sum(v => v.Ven_Total), 2),
                    ConAjustes: conAjustes
                );
            })
            .ToList();

        return new ReporteVentasResponseDto(
            Desde: desde.ToString("yyyy-MM-dd"),
            Hasta: hasta.ToString("yyyy-MM-dd"),
            NVentas: nVentas,
            Total: total,
            Efectivo: efectivo,
            Yape: yape,
            Anuladas: anuladasResumen,
            PorDia: porDia
        );
    }

    public async Task<ReportePlatosResponseDto> ObtenerReportePlatosAsync(DateOnly desde, DateOnly hasta, Guid? productoId, CancellationToken ct = default)
    {
        var desdeUtc = DateTime.SpecifyKind(desde.ToDateTime(TimeOnly.MinValue).AddHours(5), DateTimeKind.Utc);
        var hastaUtc = DateTime.SpecifyKind(hasta.ToDateTime(TimeOnly.MaxValue).AddHours(5), DateTimeKind.Utc);

        if (productoId.HasValue)
        {
            var existe = await _context.Productos.AnyAsync(p => p.Id_Producto == productoId.Value, ct);
            if (!existe)
            {
                throw new KeyNotFoundException("El producto especificado no existe.");
            }
        }

        var ventasVigentes = await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Ven_Pedido)
                .ThenInclude(p => p!.Ped_Detalles)
                    .ThenInclude(d => d.Det_Producto)
            .Where(v => v.Ven_Estado == EstadoVenta.Vigente &&
                        v.Ven_FechaHoraUtc >= desdeUtc &&
                        v.Ven_FechaHoraUtc <= hastaUtc)
            .ToListAsync(ct);

        var totalVentas = decimal.Round(ventasVigentes.Sum(v => v.Ven_Total), 2);

        var todosDetalles = ventasVigentes
            .Where(v => v.Ven_Pedido != null)
            .SelectMany(v => v.Ven_Pedido!.Ped_Detalles)
            .Where(d => d.Det_Producto != null)
            .ToList();

        var agrupadosPorProducto = todosDetalles
            .GroupBy(d => d.Id_Producto)
            .Select(g =>
            {
                var prod = g.First().Det_Producto!;
                var cantidad = g.Sum(d => d.Det_Cantidad);
                var monto = decimal.Round(g.Sum(d => d.Det_Subtotal), 2);
                return new ItemPlatoVendidoDto(
                    ProductoId: prod.Id_Producto,
                    Producto: prod.Pro_Nombre,
                    Categoria: prod.Pro_Categoria.ToString(),
                    Activo: prod.Pro_Activo,
                    Cantidad: cantidad,
                    Monto: monto
                );
            })
            .OrderByDescending(p => p.Cantidad)
            .ToList();

        var categorias = Enum.GetValues<CategoriaProducto>();
        var subtotales = categorias
            .Select(cat =>
            {
                var catStr = cat.ToString();
                var itemsCat = agrupadosPorProducto.Where(p => p.Categoria.Equals(catStr, StringComparison.OrdinalIgnoreCase)).ToList();
                return new SubtotalCategoriaDto(
                    Categoria: catStr,
                    Cantidad: itemsCat.Sum(i => i.Cantidad),
                    Monto: decimal.Round(itemsCat.Sum(i => i.Monto), 2)
                );
            })
            .ToList();

        var totalPlatos = agrupadosPorProducto.Sum(p => p.Cantidad);
        var totalMonto = decimal.Round(agrupadosPorProducto.Sum(p => p.Monto), 2);
        var coincide = (totalMonto == totalVentas);

        List<PlatoPorDiaDto>? porDia = null;
        if (productoId.HasValue)
        {
            var detallesProd = ventasVigentes
                .Where(v => v.Ven_Pedido != null)
                .SelectMany(v => v.Ven_Pedido!.Ped_Detalles
                    .Where(d => d.Id_Producto == productoId.Value)
                    .Select(d => new { VentaFecha = v.Ven_FechaHoraUtc, d.Det_Cantidad }))
                .ToList();

            porDia = detallesProd
                .GroupBy(x => TimeZoneHelper.GetFechaOperativa(x.VentaFecha))
                .OrderBy(g => g.Key)
                .Select(g => new PlatoPorDiaDto(
                    Fecha: g.Key.ToString("yyyy-MM-dd"),
                    Cantidad: g.Sum(x => x.Det_Cantidad)
                ))
                .ToList();

            agrupadosPorProducto = agrupadosPorProducto
                .Where(i => i.ProductoId == productoId.Value)
                .ToList();
        }

        return new ReportePlatosResponseDto(
            TotalPlatos: totalPlatos,
            TotalMonto: totalMonto,
            TotalVentas: totalVentas,
            Coincide: coincide,
            Subtotales: subtotales,
            Items: agrupadosPorProducto,
            PorDia: porDia
        );
    }

    public async Task RegistrarAuditoriaExportacionAsync(AuditoriaReporte auditoria, CancellationToken ct = default)
    {
        await _context.AuditoriasReporte.AddAsync(auditoria, ct);
        await _context.SaveChangesAsync(ct);
    }
}
