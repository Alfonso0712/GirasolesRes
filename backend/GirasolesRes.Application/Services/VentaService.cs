using System.Text.RegularExpressions;
using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Ventas;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class VentaService : IVentaService
{
    private readonly IVentaRepository _ventaRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IMesaRepository _mesaRepository;
    private readonly ICajaRepository _cajaRepository;
    private readonly IAuditoriaCobroRepository _auditoriaCobroRepository;

    public VentaService(
        IVentaRepository ventaRepository,
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        ICajaRepository cajaRepository,
        IAuditoriaCobroRepository auditoriaCobroRepository)
    {
        _ventaRepository = ventaRepository;
        _pedidoRepository = pedidoRepository;
        _mesaRepository = mesaRepository;
        _cajaRepository = cajaRepository;
        _auditoriaCobroRepository = auditoriaCobroRepository;
    }

    public async Task<ListarVentasResponseDto> ListarVentasAsync(
        string? busqueda,
        string? desde,
        string? hasta,
        int pagina,
        int tamano,
        string usuarioRol,
        CancellationToken ct = default)
    {
        // 1. Validar Búsqueda (RV-108)
        string? busquedaLimpia = null;
        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            busquedaLimpia = busqueda.Trim();
            if (busquedaLimpia.Length > 15 || !Regex.IsMatch(busquedaLimpia, @"^[a-zA-Z0-9\-]+$"))
            {
                throw new ArgumentException(MensajesCatalogo.MSG_156);
            }
        }

        // 2. Determinar y Validar Rango de Fechas (RV-109, RN-97)
        var hoyPeru = TimeZoneHelper.ObtenerFechaActualLima();
        DateOnly desdeDate;
        DateOnly hastaDate;

        if (string.IsNullOrWhiteSpace(desde) && string.IsNullOrWhiteSpace(hasta))
        {
            desdeDate = hoyPeru;
            hastaDate = hoyPeru;
        }
        else if (!string.IsNullOrWhiteSpace(desde) && string.IsNullOrWhiteSpace(hasta))
        {
            if (!DateOnly.TryParse(desde.Trim(), out desdeDate))
            {
                throw new ArgumentException("Formato de fecha inválido para 'desde'. Use YYYY-MM-DD.");
            }
            hastaDate = hoyPeru;
        }
        else if (string.IsNullOrWhiteSpace(desde) && !string.IsNullOrWhiteSpace(hasta))
        {
            if (!DateOnly.TryParse(hasta.Trim(), out hastaDate))
            {
                throw new ArgumentException("Formato de fecha inválido para 'hasta'. Use YYYY-MM-DD.");
            }
            desdeDate = hastaDate;
        }
        else
        {
            if (!DateOnly.TryParse(desde!.Trim(), out desdeDate) || !DateOnly.TryParse(hasta!.Trim(), out hastaDate))
            {
                throw new ArgumentException("Formato de fecha inválido. Use YYYY-MM-DD.");
            }
        }

        if (desdeDate > hastaDate)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_157);
        }

        if (desdeDate > hoyPeru || hastaDate > hoyPeru)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_158);
        }

        if ((hastaDate.DayNumber - desdeDate.DayNumber) > 31)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_158);
        }

        if (usuarioRol.Equals("Cajero", StringComparison.OrdinalIgnoreCase) && desdeDate < hoyPeru.AddDays(-7))
        {
            throw new UnauthorizedAccessException(MensajesCatalogo.MSG_159);
        }

        // Convertir a UTC con margen de zona horaria Perú (-05:00)
        var desdeUtc = DateTime.SpecifyKind(desdeDate.ToDateTime(TimeOnly.MinValue).AddHours(5), DateTimeKind.Utc);
        var hastaUtc = DateTime.SpecifyKind(hastaDate.ToDateTime(TimeOnly.MaxValue).AddHours(5), DateTimeKind.Utc);

        var (ventas, total, resumen) = await _ventaRepository.ListarVentasAsync(
            busquedaLimpia,
            desdeUtc,
            hastaUtc,
            pagina < 1 ? 1 : pagina,
            tamano < 1 ? 20 : tamano,
            ct);

        var items = ventas.Select(v =>
        {
            var localTime = TimeZoneHelper.ToPeruTime(v.Ven_FechaHoraUtc);
            var comprobanteStr = v.Ven_Comprobante?.ObtenerNumeroFormateado() ?? "S/C";
            var pedidoNum = v.Ven_Pedido?.Ped_NumeroDiario ?? 0;
            var tipoStr = v.Ven_Pedido?.Ped_Tipo == TipoPedido.ParaLlevar ? "Para Llevar" : "Salón";
            var mesaStr = v.Ven_Pedido?.Ped_Mesa?.Mes_Nombre;
            var refStr = v.Ven_Pedido?.Ped_Notas;
            var cajeroStr = v.Ven_Usuario?.Usu_Nombre ?? "Cajero";

            return new VentaItemDto(
                VentaId: v.Id_Venta,
                Comprobante: comprobanteStr,
                FechaHora: localTime,
                FechaHoraFormateada: localTime.ToString("dd/MM/yyyy HH:mm"),
                PedidoNumero: pedidoNum,
                Tipo: tipoStr,
                Mesa: mesaStr,
                Referencia: refStr,
                Total: v.Ven_Total,
                Metodo: v.Ven_MetodoPago == MetodoPago.Efectivo ? "Efectivo" : "Yape",
                Cajero: cajeroStr,
                Estado: v.Ven_Estado == EstadoVenta.Vigente ? "Vigente" : "Anulada",
                TipoComprobante: v.Ven_Comprobante?.Com_Tipo,
                ClienteDocumento: v.Ven_Comprobante?.Com_NumDocReceptor,
                ClienteNombre: v.Ven_Comprobante?.Com_RazonSocialReceptor
            );
        }).ToList().AsReadOnly();

        return new ListarVentasResponseDto(items, total, pagina, tamano, resumen);
    }

    public async Task<VentaDetalleDto> ObtenerDetalleVentaAsync(Guid ventaId, CancellationToken ct = default)
    {
        var venta = await _ventaRepository.ObtenerDetalleVentaAsync(ventaId, ct);
        if (venta == null)
        {
            throw new KeyNotFoundException("La venta solicitada no existe.");
        }

        var comprobante = venta.Ven_Comprobante;
        var pedido = venta.Ven_Pedido;
        var localTime = TimeZoneHelper.ToPeruTime(venta.Ven_FechaHoraUtc);

        var lineas = (pedido?.Ped_Detalles ?? Enumerable.Empty<DetallePedido>()).Select(d =>
        {
            var nombre = !string.IsNullOrWhiteSpace(d.Det_Nombre)
                ? d.Det_Nombre
                : d.Det_Producto?.Pro_Nombre ?? "Producto";

            string? elecciones = null;
            if (d.Det_Opciones.Count > 0)
            {
                elecciones = string.Join(" + ", d.Det_Opciones.Select(o => o.Lpo_ProductoNombre));
            }

            return new LineaVentaDetalleDto(
                Cantidad: d.Det_Cantidad,
                ProductoNombre: nombre,
                PrecioUnitario: d.Det_PrecioUnitario,
                Subtotal: d.Det_Subtotal,
                Observacion: d.Det_Observacion,
                Elecciones: elecciones,
                Incluye: d.Det_Incluye
            );
        }).ToList().AsReadOnly();

        string? fechaHoraAnulacionFormateada = null;
        if (venta.Ven_FechaHoraAnulacionUtc.HasValue)
        {
            fechaHoraAnulacionFormateada = TimeZoneHelper.ToPeruTime(venta.Ven_FechaHoraAnulacionUtc.Value).ToString("dd/MM/yyyy HH:mm");
        }

        bool cajaCerrada = venta.Ven_Caja != null && venta.Ven_Caja.Caj_Estado == EstadoCaja.Cerrada;

        return new VentaDetalleDto(
            VentaId: venta.Id_Venta,
            ComprobanteId: comprobante?.Id_Comprobante ?? Guid.Empty,
            Comprobante: comprobante?.ObtenerNumeroFormateado() ?? "S/C",
            FechaHoraUtc: venta.Ven_FechaHoraUtc,
            FechaHoraFormateada: localTime.ToString("dd/MM/yyyy HH:mm"),
            PedidoId: pedido?.Id_Pedido ?? Guid.Empty,
            PedidoNumero: pedido?.Ped_NumeroDiario ?? 0,
            Tipo: pedido?.Ped_Tipo == TipoPedido.ParaLlevar ? "Para Llevar" : "Salón",
            Mesa: pedido?.Ped_Mesa?.Mes_Nombre,
            Referencia: pedido?.Ped_Notas,
            Total: venta.Ven_Total,
            Metodo: venta.Ven_MetodoPago == MetodoPago.Efectivo ? "Efectivo" : "Yape",
            MontoRecibido: venta.Ven_MontoRecibido,
            Vuelto: venta.Ven_Vuelto,
            YapeReferencia: venta.Ven_YapeReferencia,
            Cajero: venta.Ven_Usuario?.Usu_Nombre ?? "Cajero",
            Estado: venta.Ven_Estado == EstadoVenta.Vigente ? "Vigente" : "Anulada",
            CajaCerrada: cajaCerrada,
            Lineas: lineas,
            MotivoAnulacion: venta.Ven_MotivoAnulacion,
            UsuarioAnulacion: venta.Ven_UsuarioAnulacion,
            FechaHoraAnulacionFormateada: fechaHoraAnulacionFormateada,
            DestinoPedido: venta.Ven_DestinoPedido,
            TipoComprobante: comprobante?.Com_Tipo,
            TipoDocReceptor: comprobante?.Com_TipoDocReceptor,
            NumDocReceptor: comprobante?.Com_NumDocReceptor,
            RazonSocialReceptor: comprobante?.Com_RazonSocialReceptor,
            DireccionReceptor: comprobante?.Com_DireccionReceptor,
            OpGravada: comprobante?.Com_OpGravada ?? 0.00m,
            Igv: comprobante?.Com_Igv ?? 0.00m
        );
    }

    public async Task<AnularVentaResponseDto> AnularVentaAsync(
        Guid ventaId,
        AnularVentaRequest request,
        string adminNombreUsuario,
        string usuarioRol,
        string? direccionIp = null,
        CancellationToken ct = default)
    {
        // RN-96 / RV-112: Solo el Administrador puede anular ventas
        if (!usuarioRol.Equals("Administrador", StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Solo el Administrador tiene autorización para anular ventas.");
        }

        if (string.IsNullOrWhiteSpace(request.SolicitudId))
        {
            throw new ArgumentException("El identificador único de solicitud es obligatorio.");
        }

        var motivoLimpio = request.Motivo?.Trim() ?? string.Empty;
        if (motivoLimpio.Length < 5 || motivoLimpio.Length > 100)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_160);
        }

        var destino = request.DestinoPedido?.Trim().ToLower() ?? "porcobrar";
        if (destino != "porcobrar" && destino != "anular")
        {
            throw new ArgumentException("El destino del pedido debe ser 'porCobrar' o 'anular'.");
        }

        // Idempotencia por solicitudId (RNF-42)
        var ventaExistenteSol = await _ventaRepository.ObtenerPorSolicitudIdAsync(request.SolicitudId, ct);
        if (ventaExistenteSol != null && ventaExistenteSol.Ven_Estado == EstadoVenta.Anulada)
        {
            var comp = ventaExistenteSol.Ven_Comprobante?.ObtenerNumeroFormateado() ?? "";
            return new AnularVentaResponseDto("Anulada", ventaExistenteSol.Ven_Pedido?.Ped_Estado.ToString() ?? "Listo", comp, "Venta anulada previamente con éxito.");
        }

        var venta = await _ventaRepository.ObtenerDetalleVentaAsync(ventaId, ct);
        if (venta == null)
        {
            throw new KeyNotFoundException("La venta no existe.");
        }

        if (venta.Ven_Estado == EstadoVenta.Anulada)
        {
            throw new CobroConflictException("venta_ya_anulada", MensajesCatalogo.MSG_163);
        }

        var comprobante = venta.Ven_Comprobante;
        var pedido = venta.Ven_Pedido;

        // 1. Marcar venta como anulada
        venta.Anular(motivoLimpio, adminNombreUsuario, destino);

        // 2. Marcar comprobante como anulado (su correlativo no se reutiliza)
        comprobante?.Anular();

        // 3. Destino del pedido (RN-102, RN-103)
        Mesa? mesaALiberar = null;
        if (pedido != null)
        {
            if (destino == "porcobrar")
            {
                pedido.CambiarEstado(EstadoPedido.Listo);
            }
            else
            {
                pedido.Anular($"Venta {comprobante?.ObtenerNumeroFormateado()} anulada: {motivoLimpio}");

                if (pedido.Id_Mesa.HasValue)
                {
                    var tieneOtrosPedidos = await _pedidoRepository.TieneOtrosPedidosAbiertosEnMesaAsync(pedido.Id_Mesa.Value, pedido.Id_Pedido, ct);
                    if (!tieneOtrosPedidos)
                    {
                        mesaALiberar = await _mesaRepository.ObtenerPorIdAsync(pedido.Id_Mesa.Value, ct);
                        mesaALiberar?.CambiarOcupacion(EstadoOcupacionMesa.Libre);
                    }
                }
            }
        }

        // 4. Registrar auditoría (RN-105)
        var auditoria = new AuditoriaCobro(
            audUsuario: adminNombreUsuario,
            audAccion: "ANULAR_VENTA",
            audNumeroPedido: pedido?.Ped_NumeroDiario ?? 0,
            audComprobante: comprobante?.ObtenerNumeroFormateado() ?? "S/C",
            audMedioPago: venta.Ven_MetodoPago.ToString(),
            audTotal: venta.Ven_Total,
            audMontoRecibido: venta.Ven_MontoRecibido,
            audVuelto: venta.Ven_Vuelto,
            audDetalle: $"Venta anulada por {adminNombreUsuario}. Motivo: {motivoLimpio}. Destino pedido: {(destino == "porcobrar" ? "Por cobrar" : "Anulado")}.",
            audDireccionIp: direccionIp
        );

        // 5. Ejecutar transacción atómica
        await _ventaRepository.AnularVentaTransaccionalAsync(venta, comprobante!, pedido!, mesaALiberar, auditoria, ct);

        var compNumero = comprobante?.ObtenerNumeroFormateado() ?? "";
        var pedNumero = pedido?.Ped_NumeroDiario ?? 0;
        string mensaje = destino == "porcobrar"
            ? string.Format(MensajesCatalogo.MSG_162_PENDIENTE_COBRO, compNumero, pedNumero)
            : string.Format(MensajesCatalogo.MSG_162_ANULADO, compNumero, pedNumero);

        return new AnularVentaResponseDto(
            Estado: "Anulada",
            PedidoEstado: pedido?.Ped_Estado.ToString() ?? "Anulado",
            Comprobante: compNumero,
            Mensaje: mensaje
        );
    }
}
