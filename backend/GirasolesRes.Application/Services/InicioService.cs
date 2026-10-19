using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Inicio;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class InicioService : IInicioService
{
    private readonly IReporteService _reporteService;
    private readonly ICajaService _cajaService;
    private readonly ICajaRepository _cajaRepository;
    private readonly IMesaService _mesaService;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IMenuDiaService _menuDiaService;
    private readonly IComandaService _comandaService;

    private static readonly HashSet<string> BloquesAdmin = new(StringComparer.OrdinalIgnoreCase)
    {
        "ventasHoy", "platosHoy", "pedidosPorEstado", "mesas", "caja", "menu", "ultimoCierre", "alertas"
    };

    private static readonly HashSet<string> BloquesCajero = new(StringComparer.OrdinalIgnoreCase)
    {
        "caja", "porCobrar", "listos"
    };

    private static readonly HashSet<string> BloquesMozo = new(StringComparer.OrdinalIgnoreCase)
    {
        "mesas", "misPedidosEnCurso", "misListos"
    };

    private static readonly HashSet<string> BloquesCocinero = new(StringComparer.OrdinalIgnoreCase)
    {
        "comandas", "agotados"
    };

    public InicioService(
        IReporteService reporteService,
        ICajaService cajaService,
        ICajaRepository cajaRepository,
        IMesaService mesaService,
        IPedidoRepository pedidoRepository,
        IMenuDiaService menuDiaService,
        IComandaService comandaService)
    {
        _reporteService = reporteService;
        _cajaService = cajaService;
        _cajaRepository = cajaRepository;
        _mesaService = mesaService;
        _pedidoRepository = pedidoRepository;
        _menuDiaService = menuDiaService;
        _comandaService = comandaService;
    }

    public async Task<InicioResponseDto> ObtenerInicioAsync(string rol, Guid usuarioId, CancellationToken ct = default)
    {
        var fechaActual = TimeZoneHelper.ObtenerFechaActualLima();
        var fechaStr = fechaActual.ToString("yyyy-MM-dd");
        var bloques = new Dictionary<string, BloqueResultadoDto>(StringComparer.OrdinalIgnoreCase);

        var rolNormalizado = rol?.Trim() ?? string.Empty;

        if (rolNormalizado.Equals("Administrador", StringComparison.OrdinalIgnoreCase))
        {
            bloques["ventasHoy"] = await EjecutarBloqueAsync(() => ObtenerVentasHoyAsync(fechaStr, ct));
            bloques["platosHoy"] = await EjecutarBloqueAsync(() => ObtenerPlatosHoyAsync(fechaStr, ct));
            bloques["pedidosPorEstado"] = await EjecutarBloqueAsync(() => ObtenerPedidosPorEstadoAsync(fechaActual, ct));
            bloques["mesas"] = await EjecutarBloqueAsync(() => ObtenerMesasAsync(ct));
            bloques["caja"] = await EjecutarBloqueAsync(() => ObtenerCajaAdminAsync(fechaActual, ct));
            bloques["menu"] = await EjecutarBloqueAsync(() => ObtenerMenuAdminAsync(ct));
            bloques["ultimoCierre"] = await EjecutarBloqueAsync(() => ObtenerUltimoCierreAsync(ct));
            bloques["alertas"] = await EjecutarBloqueAsync(() => ObtenerAlertasAdminAsync(fechaActual, fechaStr, ct));
        }
        else if (rolNormalizado.Equals("Cajero", StringComparison.OrdinalIgnoreCase))
        {
            bloques["caja"] = await EjecutarBloqueAsync(() => ObtenerCajaCajeroAsync(usuarioId, fechaActual, ct));
            bloques["porCobrar"] = await EjecutarBloqueAsync(() => ObtenerPorCobrarCajeroAsync(ct));
            bloques["listos"] = await EjecutarBloqueAsync(() => ObtenerListosCajeroAsync(ct));
        }
        else if (rolNormalizado.Equals("Mozo", StringComparison.OrdinalIgnoreCase))
        {
            bloques["mesas"] = await EjecutarBloqueAsync(() => ObtenerMesasAsync(ct));
            bloques["misPedidosEnCurso"] = await EjecutarBloqueAsync(() => ObtenerMisPedidosEnCursoAsync(usuarioId, fechaActual, ct));
            bloques["misListos"] = await EjecutarBloqueAsync(() => ObtenerMisListosAsync(usuarioId, fechaActual, ct));
        }
        else if (rolNormalizado.Equals("Cocinero", StringComparison.OrdinalIgnoreCase))
        {
            bloques["comandas"] = await EjecutarBloqueAsync(() => ObtenerComandasCocineroAsync(ct));
            bloques["agotados"] = await EjecutarBloqueAsync(() => ObtenerAgotadosCocineroAsync(ct));
        }
        else
        {
            throw new UnauthorizedAccessException(MensajesCatalogo.MSG_39);
        }

        return new InicioResponseDto(rolNormalizado, fechaStr, bloques);
    }

    public async Task<BloqueResultadoDto> ObtenerBloqueAsync(string bloque, string rol, Guid usuarioId, CancellationToken ct = default)
    {
        var rolNormalizado = rol?.Trim() ?? string.Empty;
        var b = bloque?.Trim() ?? string.Empty;

        var esAdmin = rolNormalizado.Equals("Administrador", StringComparison.OrdinalIgnoreCase);
        var esCajero = rolNormalizado.Equals("Cajero", StringComparison.OrdinalIgnoreCase);
        var esMozo = rolNormalizado.Equals("Mozo", StringComparison.OrdinalIgnoreCase);
        var esCocinero = rolNormalizado.Equals("Cocinero", StringComparison.OrdinalIgnoreCase);

        var existeBloque = BloquesAdmin.Contains(b) || BloquesCajero.Contains(b) || BloquesMozo.Contains(b) || BloquesCocinero.Contains(b);
        if (!existeBloque)
        {
            throw new KeyNotFoundException("Bloque no encontrado.");
        }

        // RV-154, RN-125: El servidor no envía datos que el rol no puede ver (403)
        var tienePermiso = (esAdmin && BloquesAdmin.Contains(b)) ||
                           (esCajero && BloquesCajero.Contains(b)) ||
                           (esMozo && BloquesMozo.Contains(b)) ||
                           (esCocinero && BloquesCocinero.Contains(b));

        if (!tienePermiso)
        {
            throw new UnauthorizedAccessException(MensajesCatalogo.MSG_39);
        }

        var fechaActual = TimeZoneHelper.ObtenerFechaActualLima();
        var fechaStr = fechaActual.ToString("yyyy-MM-dd");

        return await EjecutarBloqueAsync(async () =>
        {
            object datos = b.ToLowerInvariant() switch
            {
                "ventashoy" => await ObtenerVentasHoyAsync(fechaStr, ct),
                "platoshoy" => await ObtenerPlatosHoyAsync(fechaStr, ct),
                "pedidosporestado" => await ObtenerPedidosPorEstadoAsync(fechaActual, ct),
                "mesas" => await ObtenerMesasAsync(ct),
                "caja" when esAdmin => await ObtenerCajaAdminAsync(fechaActual, ct),
                "caja" when esCajero => await ObtenerCajaCajeroAsync(usuarioId, fechaActual, ct),
                "menu" => await ObtenerMenuAdminAsync(ct),
                "ultimocierre" => await ObtenerUltimoCierreAsync(ct),
                "alertas" => await ObtenerAlertasAdminAsync(fechaActual, fechaStr, ct),
                "porcobrar" => await ObtenerPorCobrarCajeroAsync(ct),
                "listos" => await ObtenerListosCajeroAsync(ct),
                "mispedidosencurso" => await ObtenerMisPedidosEnCursoAsync(usuarioId, fechaActual, ct),
                "mislistos" => await ObtenerMisListosAsync(usuarioId, fechaActual, ct),
                "comandas" => await ObtenerComandasCocineroAsync(ct),
                "agotados" => await ObtenerAgotadosCocineroAsync(ct),
                _ => throw new KeyNotFoundException("Bloque no soportado.")
            };
            return datos;
        });
    }

    private async Task<BloqueResultadoDto> EjecutarBloqueAsync<T>(Func<Task<T>> accion)
    {
        try
        {
            var resultado = await accion();
            return new BloqueResultadoDto("ok", resultado);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[InicioService] Error al calcular bloque de inicio: {ex.Message}");
            return new BloqueResultadoDto("error", null, MensajesCatalogo.MSG_209);
        }
    }

    // ==========================================
    // Cálculos de bloques individuales
    // ==========================================

    private async Task<BloqueVentasHoyDto> ObtenerVentasHoyAsync(string fechaStr, CancellationToken ct)
    {
        var ventas = await _reporteService.ConsultarReporteVentasAsync(fechaStr, fechaStr, ct);
        return new BloqueVentasHoyDto(
            ventas.NVentas,
            ventas.Total,
            ventas.Efectivo,
            ventas.Yape
        );
    }

    private async Task<BloquePlatosHoyDto> ObtenerPlatosHoyAsync(string fechaStr, CancellationToken ct)
    {
        var reportePlatos = await _reporteService.ConsultarReportePlatosAsync(fechaStr, fechaStr, null, ct);
        
        var itemsCarta = (reportePlatos.Items ?? new())
            .Select(i => new PlatoPrincipalDto(i.Producto, i.Cantidad));

        var itemsMenus = (reportePlatos.MenusCompletos ?? new())
            .Select(m => new PlatoPrincipalDto(m.Nombre, m.Cantidad));

        var principales = itemsCarta
            .Concat(itemsMenus)
            .OrderByDescending(i => i.Cantidad)
            .Take(5)
            .ToList();

        return new BloquePlatosHoyDto(reportePlatos.TotalPlatos, principales);
    }

    private async Task<BloquePedidosPorEstadoDto> ObtenerPedidosPorEstadoAsync(DateOnly fechaActual, CancellationToken ct)
    {
        var (_, _, pendiente, enPreparacion, listo, pagado, anulado) = await _pedidoRepository.ListarPaginadoAsync(
            fechaActual, null, null, null, null, 1, 1000, ct
        );

        // Desacoplado: porCobrar representa únicamente los pedidos cuyo estado es Listo (pendientes de pago)
        var porCobrar = listo;

        return new BloquePedidosPorEstadoDto(
            pendiente,
            enPreparacion,
            listo,
            porCobrar,
            pagado,
            anulado
        );
    }

    private async Task<BloqueMesasDto> ObtenerMesasAsync(CancellationToken ct)
    {
        var res = await _mesaService.ObtenerResumenAsync(ct);
        var datos = res.Data;
        return new BloqueMesasDto(datos?.Libres ?? 0, datos?.Ocupadas ?? 0);
    }

    private async Task<BloqueCajaAdminDto> ObtenerCajaAdminAsync(DateOnly fechaActual, CancellationToken ct)
    {
        var estadoCaja = await _cajaService.ConsultarEstadoActualAsync(null, ct);
        var estado = estadoCaja.Estado;

        if (estado == "abierta")
        {
            var hora = estadoCaja.Apertura?.FechaAperturaLocal ?? estadoCaja.Apertura?.FechaApertura.ToString("HH:mm");
            var efectivoEsperado = (estadoCaja.Apertura?.MontoInicial ?? 0m) + (estadoCaja.ResumenParcial?.TotalEfectivo ?? 0m);
            return new BloqueCajaAdminDto("Abierta", hora, estadoCaja.Apertura?.NombreUsuarioApertura, efectivoEsperado);
        }
        else if (estado == "anteriorSinCerrar")
        {
            var fecha = estadoCaja.Apertura?.FechaAperturaLocal ?? estadoCaja.Apertura?.FechaApertura.ToString("dd/MM/yyyy");
            var efectivoEsperado = (estadoCaja.Apertura?.MontoInicial ?? 0m) + (estadoCaja.ResumenParcial?.TotalEfectivo ?? 0m);
            return new BloqueCajaAdminDto("Anterior sin cerrar", fecha, estadoCaja.Apertura?.NombreUsuarioApertura, efectivoEsperado);
        }
        else
        {
            // Verificar si hoy se cerró una caja
            var ultimaCerrada = await _cajaRepository.ObtenerUltimaCajaCerradaAsync(ct);
            if (ultimaCerrada?.Caj_FechaCierreUtc != null)
            {
                var fechaCierreLima = TimeZoneHelper.GetFechaOperativa(ultimaCerrada.Caj_FechaCierreUtc.Value);
                if (fechaCierreLima == fechaActual)
                {
                    return new BloqueCajaAdminDto("Cerrada", null, null, null);
                }
            }
            return new BloqueCajaAdminDto("Sin abrir", null, null, null);
        }
    }

    private async Task<BloqueMenuAdminDto> ObtenerMenuAdminAsync(CancellationToken ct)
    {
        var menuRes = await _menuDiaService.ObtenerMenuHoyAsync(ct);
        var menu = menuRes.Data;
        if (menu == null || !menu.Definido)
        {
            return new BloqueMenuAdminDto(false, 0, 0);
        }

        var totalPlatos = menu.Platos.Count;
        var agotados = menu.Platos.Count(p => p.Agotado);
        return new BloqueMenuAdminDto(true, totalPlatos, agotados);
    }

    private async Task<BloqueUltimoCierreDto> ObtenerUltimoCierreAsync(CancellationToken ct)
    {
        var ultimaCerrada = await _cajaRepository.ObtenerUltimaCajaCerradaAsync(ct);
        if (ultimaCerrada == null)
        {
            return new BloqueUltimoCierreDto(null, null, null);
        }

        var fecha = ultimaCerrada.Caj_FechaCierreUtc.HasValue
            ? TimeZoneHelper.ConvertirUtcALocal(ultimaCerrada.Caj_FechaCierreUtc.Value).ToString("dd/MM/yyyy")
            : null;

        var dif = ultimaCerrada.Caj_Diferencia ?? 0m;
        var resultado = dif == 0 ? "Cuadra" : (dif > 0 ? "Sobrante" : "Faltante");

        return new BloqueUltimoCierreDto(fecha, resultado, Math.Abs(dif));
    }

    private async Task<List<AlertaInicioDto>> ObtenerAlertasAdminAsync(DateOnly fechaActual, string fechaStr, CancellationToken ct)
    {
        var alertas = new List<AlertaInicioDto>();

        // 1. Caja anterior sin cerrar (RN-108, MSG-168, Prioridad 1)
        var cajaAnterior = await _cajaRepository.ObtenerCajaAnteriorSinCerrarAsync(DateTime.UtcNow.AddHours(-5), ct);
        if (cajaAnterior != null)
        {
            var fecha = TimeZoneHelper.ConvertirUtcALocal(cajaAnterior.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy");
            alertas.Add(new AlertaInicioDto(
                "caja_anterior",
                string.Format(MensajesCatalogo.MSG_168, fecha),
                "caja",
                1
            ));
        }

        // 2. Menú de hoy sin definir (MSG-204, Prioridad 2)
        var menuRes = await _menuDiaService.ObtenerMenuHoyAsync(ct);
        var menu = menuRes.Data;
        var menuDefinido = menu != null && menu.Definido;
        if (!menuDefinido)
        {
            alertas.Add(new AlertaInicioDto(
                "menu_sin_definir",
                MensajesCatalogo.MSG_204,
                "menu-dia",
                2
            ));
        }

        // 3. Comandas con más de 15 minutos de espera (MSG-205, Prioridad 3)
        var comandas = await _comandaService.ListarComandasAsync("pendiente,enPreparacion");
        var demoraCount = comandas.Items.Count(c => c.MinutosEspera >= 15);
        if (demoraCount > 0)
        {
            alertas.Add(new AlertaInicioDto(
                "comandas_demora",
                string.Format(MensajesCatalogo.MSG_205, demoraCount),
                "pedidos",
                3
            ));
        }

        // 4. Platos agotados hoy (MSG-206, Prioridad 4)
        if (menuDefinido && menu != null)
        {
            var agotadosCount = menu.Platos.Count(p => p.Agotado);
            if (agotadosCount > 0)
            {
                alertas.Add(new AlertaInicioDto(
                    "platos_agotados",
                    string.Format(MensajesCatalogo.MSG_206, agotadosCount),
                    "menu-dia",
                    4
                ));
            }
        }

        // 5. Ventas anuladas hoy (MSG-207, Prioridad 5)
        var ventasHoy = await _reporteService.ConsultarReporteVentasAsync(fechaStr, fechaStr, ct);
        if (ventasHoy.Anuladas != null && ventasHoy.Anuladas.Cantidad > 0)
        {
            alertas.Add(new AlertaInicioDto(
                "ventas_anuladas",
                string.Format(MensajesCatalogo.MSG_207, ventasHoy.Anuladas.Cantidad, ventasHoy.Anuladas.Monto),
                "ventas",
                5
            ));
        }

        // 6. Último cierre con diferencia (MSG-208, Prioridad 6)
        var ultimaCerrada = await _cajaRepository.ObtenerUltimaCajaCerradaAsync(ct);
        if (ultimaCerrada != null && (ultimaCerrada.Caj_Diferencia ?? 0m) != 0m)
        {
            var tipo = (ultimaCerrada.Caj_Diferencia > 0) ? "sobrante" : "faltante";
            var fecha = ultimaCerrada.Caj_FechaCierreUtc.HasValue
                ? TimeZoneHelper.ConvertirUtcALocal(ultimaCerrada.Caj_FechaCierreUtc.Value).ToString("dd/MM/yyyy")
                : "reciente";
            alertas.Add(new AlertaInicioDto(
                "ultimo_cierre_diferencia",
                string.Format(MensajesCatalogo.MSG_208, fecha, tipo, Math.Abs(ultimaCerrada.Caj_Diferencia ?? 0m)),
                "historial-cierres",
                6
            ));
        }

        return alertas.OrderBy(a => a.Prioridad).ToList();
    }

    // ==========================================
    // Cálculos específicos para Cajero
    // ==========================================

    private async Task<BloqueCajaCajeroDto> ObtenerCajaCajeroAsync(Guid usuarioId, DateOnly fechaActual, CancellationToken ct)
    {
        var cajaActualRes = await _cajaService.ConsultarEstadoActualAsync(usuarioId, ct);
        var estado = cajaActualRes.Estado;

        if (estado == "abierta")
        {
            var ap = cajaActualRes.Apertura;
            var rp = cajaActualRes.ResumenParcial;
            var efectivo = rp?.TotalEfectivo ?? 0m;
            var montoIni = ap?.MontoInicial ?? 0m;
            return new BloqueCajaCajeroDto(
                "Abierta",
                rp?.CantidadVentas ?? 0,
                efectivo,
                rp?.TotalYape ?? 0m,
                rp?.TotalVentas ?? 0m,
                montoIni,
                montoIni + efectivo
            );
        }
        else if (estado == "anteriorSinCerrar")
        {
            var ap = cajaActualRes.Apertura;
            var rp = cajaActualRes.ResumenParcial;
            var efectivo = rp?.TotalEfectivo ?? 0m;
            var montoIni = ap?.MontoInicial ?? 0m;
            return new BloqueCajaCajeroDto(
                "Anterior sin cerrar",
                rp?.CantidadVentas ?? 0,
                efectivo,
                rp?.TotalYape ?? 0m,
                rp?.TotalVentas ?? 0m,
                montoIni,
                montoIni + efectivo
            );
        }
        else
        {
            var ultimaCerrada = await _cajaRepository.ObtenerUltimaCajaCerradaAsync(ct);
            var estaCerradaHoy = false;
            if (ultimaCerrada?.Caj_FechaCierreUtc != null)
            {
                var fechaCierreLima = TimeZoneHelper.GetFechaOperativa(ultimaCerrada.Caj_FechaCierreUtc.Value);
                if (fechaCierreLima == fechaActual) estaCerradaHoy = true;
            }

            return new BloqueCajaCajeroDto(
                estaCerradaHoy ? "Cerrada" : "Sin abrir",
                0, 0m, 0m, 0m, 0m, 0m
            );
        }
    }

    private async Task<BloquePorCobrarDto> ObtenerPorCobrarCajeroAsync(CancellationToken ct)
    {
        var pedidos = await _pedidoRepository.ListarPedidosPendientesCobroAsync(null, ct);
        var pedidosListos = pedidos.Where(p => p.Ped_Estado == EstadoPedido.Listo).ToList();
        return new BloquePorCobrarDto(pedidosListos.Count, pedidosListos.Sum(p => p.Ped_Total));
    }

    private async Task<BloqueListosDto> ObtenerListosCajeroAsync(CancellationToken ct)
    {
        var pedidos = await _pedidoRepository.ListarPedidosPendientesCobroAsync(null, ct);
        var listos = pedidos.Count(p => p.Ped_Estado == EstadoPedido.Listo);
        return new BloqueListosDto(listos);
    }

    // ==========================================
    // Cálculos específicos para Mozo
    // ==========================================

    private async Task<BloqueMisPedidosEnCursoDto> ObtenerMisPedidosEnCursoAsync(Guid usuarioId, DateOnly fechaActual, CancellationToken ct)
    {
        var (_, _, pendiente, enPreparacion, _, _, _) = await _pedidoRepository.ListarPaginadoAsync(
            fechaActual, null, null, null, usuarioId, 1, 1000, ct
        );
        return new BloqueMisPedidosEnCursoDto(pendiente + enPreparacion);
    }

    private async Task<BloqueMisListosDto> ObtenerMisListosAsync(Guid usuarioId, DateOnly fechaActual, CancellationToken ct)
    {
        var (_, _, _, _, listo, _, _) = await _pedidoRepository.ListarPaginadoAsync(
            fechaActual, null, null, null, usuarioId, 1, 1000, ct
        );
        return new BloqueMisListosDto(listo);
    }

    // ==========================================
    // Cálculos específicos para Cocinero
    // ==========================================

    private async Task<BloqueComandasCocineroDto> ObtenerComandasCocineroAsync(CancellationToken ct)
    {
        var comandas = await _comandaService.ListarComandasAsync("pendiente,enPreparacion");
        var pendientes = comandas.Items.Count(c => c.Estado.Equals("pendiente", StringComparison.OrdinalIgnoreCase));
        var enPreparacion = comandas.Items.Count(c => c.Estado.Equals("enPreparacion", StringComparison.OrdinalIgnoreCase));
        var masAntiguaMinutos = comandas.Items.Any() ? comandas.Items.Max(c => c.MinutosEspera) : 0;

        return new BloqueComandasCocineroDto(pendientes, enPreparacion, masAntiguaMinutos);
    }

    private async Task<BloqueAgotadosCocineroDto> ObtenerAgotadosCocineroAsync(CancellationToken ct)
    {
        var menuRes = await _menuDiaService.ObtenerMenuHoyAsync(ct);
        var menu = menuRes.Data;
        var agotados = (menu?.Platos ?? new())
            .Where(p => p.Agotado)
            .Select(p => p.Nombre)
            .ToList();

        return new BloqueAgotadosCocineroDto(agotados.Count, agotados);
    }
}
