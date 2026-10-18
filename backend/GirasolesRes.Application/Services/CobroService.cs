using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Cobros;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Services;

public class CobroService : ICobroService
{
    private readonly ICajaRepository _cajaRepository;
    private readonly IVentaRepository _ventaRepository;
    private readonly IComprobanteRepository _comprobanteRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IMesaRepository _mesaRepository;
    private readonly IAuditoriaCobroRepository _auditoriaCobroRepository;

    public CobroService(
        ICajaRepository cajaRepository,
        IVentaRepository ventaRepository,
        IComprobanteRepository comprobanteRepository,
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        IAuditoriaCobroRepository auditoriaCobroRepository)
    {
        _cajaRepository = cajaRepository;
        _ventaRepository = ventaRepository;
        _comprobanteRepository = comprobanteRepository;
        _pedidoRepository = pedidoRepository;
        _mesaRepository = mesaRepository;
        _auditoriaCobroRepository = auditoriaCobroRepository;
    }

    public async Task<IReadOnlyList<PedidoPendienteCobroDto>> ObtenerPedidosPendientesCobroAsync(CancellationToken ct = default)
    {
        // RV-95 / RN-84: Debe haber caja abierta para consultar y cobrar
        var cajaAbierta = await _cajaRepository.ObtenerCajaAbiertaActualAsync(ct);
        if (cajaAbierta == null)
        {
            throw new CobroConflictException("caja_cerrada", MensajesCatalogo.MSG_135);
        }

        var pedidos = await _pedidoRepository.ListarPedidosPendientesCobroAsync(ct);

        return pedidos.Select(p => new PedidoPendienteCobroDto(
            PedidoId: p.Id_Pedido,
            Numero: p.Ped_NumeroDiario,
            Tipo: p.Ped_Tipo.ToString(),
            Mesa: p.Ped_Mesa?.Mes_Nombre,
            Referencia: p.Ped_Notas,
            Hora: TimeZoneHelper.ToPeruTime(p.Ped_FechaHoraUtc).ToString("HH:mm"),
            Estado: p.Ped_Estado.ToString(),
            Total: p.Ped_Total,
            EstaListo: p.Ped_Estado == EstadoPedido.Listo
        )).ToList().AsReadOnly();
    }

    public async Task<CobroResponseDto> ProcesarCobroAsync(
        CobroRequest request,
        Guid cajeroUsuarioId,
        string cajeroNombreUsuario,
        string? direccionIp,
        CancellationToken ct = default)
    {
        // 1. Idempotencia por solicitudId (RNF-39)
        var ventaExistente = await _ventaRepository.ObtenerPorSolicitudIdAsync(request.SolicitudId, ct);
        if (ventaExistente != null)
        {
            var comprobanteExistente = await _comprobanteRepository.ObtenerPorVentaIdAsync(ventaExistente.Id_Venta, ct);
            var fechaLocalExistente = TimeZoneHelper.ToPeruTime(comprobanteExistente?.Com_FechaHoraUtc ?? ventaExistente.Ven_FechaHoraUtc).ToString("dd/MM/yyyy HH:mm");
            var numFmtExistente = comprobanteExistente?.ObtenerNumeroFormateado() ?? $"T001-{comprobanteExistente?.Com_Numero:D6}";

            return new CobroResponseDto(
                VentaId: ventaExistente.Id_Venta,
                Comprobante: new ComprobanteResumenDto(
                    Serie: comprobanteExistente?.Com_Serie ?? "T001",
                    Numero: comprobanteExistente?.Com_Numero ?? 0,
                    NumeroFormateado: numFmtExistente,
                    FechaHoraUtc: comprobanteExistente?.Com_FechaHoraUtc ?? ventaExistente.Ven_FechaHoraUtc,
                    FechaHoraLocal: fechaLocalExistente
                ),
                Vuelto: ventaExistente.Ven_Vuelto ?? 0.00m,
                Mensaje: string.Format(MensajesCatalogo.MSG_146, numFmtExistente, ventaExistente.Ven_Total)
            );
        }

        // 2. Precondición: Caja abierta (RV-95, RN-84)
        var cajaAbierta = await _cajaRepository.ObtenerCajaAbiertaActualAsync(ct);
        if (cajaAbierta == null)
        {
            throw new CobroConflictException("caja_cerrada", MensajesCatalogo.MSG_135);
        }

        // 3. Obtener pedido con detalles (bloqueo transaccional)
        var pedido = await _pedidoRepository.ObtenerDetalleCompletoPorIdAsync(request.PedidoId, ct);

        if (pedido == null)
        {
            throw new KeyNotFoundException("El pedido solicitado no existe.");
        }

        // 4. Validar que no esté pagado ni anulado (RV-95, RN-85)
        if (pedido.Ped_Estado == EstadoPedido.Pagado || pedido.Ped_Estado == EstadoPedido.Anulado)
        {
            throw new CobroConflictException("pedido_no_cobrable", string.Format(MensajesCatalogo.MSG_137, pedido.Ped_NumeroDiario));
        }

        // 5. Validar que el total no haya cambiado durante el cobro (RV-101, RN-90)
        var totalReal = decimal.Round(pedido.Ped_Total, 2);
        var totalMostrado = decimal.Round(request.TotalMostrado, 2);
        if (totalReal != totalMostrado)
        {
            throw new CobroConflictException("total_cambio", string.Format(MensajesCatalogo.MSG_139, totalReal), totalReal);
        }

        // 6. Validar método de pago (RV-98, RN-86)
        var metodoNormalizado = request.Metodo.Trim().ToLowerInvariant();
        MetodoPago metodoPago;
        decimal? montoRecibido = null;
        decimal vuelto = 0.00m;
        bool yapeConfirmado = false;
        string? yapeReferencia = null;

        if (metodoNormalizado == "efectivo")
        {
            metodoPago = MetodoPago.Efectivo;

            if (!request.MontoRecibido.HasValue)
            {
                throw new ArgumentException(MensajesCatalogo.MSG_141);
            }

            var recibido = decimal.Round(request.MontoRecibido.Value, 2);

            if (recibido > 9999.99m)
            {
                throw new ArgumentException(MensajesCatalogo.MSG_152);
            }

            if (recibido < totalReal)
            {
                throw new ArgumentException(string.Format(MensajesCatalogo.MSG_143, totalReal - recibido));
            }

            montoRecibido = recibido;
            vuelto = decimal.Round(recibido - totalReal, 2);
        }
        else if (metodoNormalizado == "yape")
        {
            metodoPago = MetodoPago.Yape;

            if (request.YapeConfirmado != true)
            {
                throw new ArgumentException(MensajesCatalogo.MSG_144);
            }

            if (!string.IsNullOrWhiteSpace(request.YapeReferencia))
            {
                var refTrim = request.YapeReferencia.Trim();
                if (refTrim.Length > 20)
                {
                    throw new ArgumentException(MensajesCatalogo.MSG_151);
                }
                yapeReferencia = refTrim;
            }

            yapeConfirmado = true;
            montoRecibido = totalReal;
            vuelto = 0.00m;
        }
        else
        {
            throw new ArgumentException(MensajesCatalogo.MSG_140);
        }

        // A. Crear la venta
        var venta = new Venta(
            idPedido: pedido.Id_Pedido,
            idUsuario: cajeroUsuarioId,
            idCaja: cajaAbierta.Id_Caja,
            venTotal: totalReal,
            venMetodoPago: metodoPago,
            venSolicitudId: request.SolicitudId.Trim(),
            venMontoRecibido: montoRecibido,
            venVuelto: vuelto,
            venYapeConfirmado: yapeConfirmado,
            venYapeReferencia: yapeReferencia
        );

        // B. Generar Comprobante con serie T001 y correlativo continuo único (RN-91)
        var siguienteNumero = await _comprobanteRepository.ObtenerSiguienteNumeroCorrelativoAsync("T001", ct);
        var comprobante = new Comprobante(
            idVenta: venta.Id_Venta,
            comNumero: siguienteNumero,
            comTotal: totalReal,
            comMetodoPago: metodoPago,
            comSerie: "T001",
            comTipo: "Ticket",
            comLeyenda: "Documento sin validez tributaria"
        );

        // C. Pasar pedido a Pagado (RN-88, RN-93)
        pedido.CambiarEstado(EstadoPedido.Pagado);

        // D. Liberación automática de mesa si corresponde (CUS11.4 / RN-89)
        Mesa? mesaALiberar = null;
        if (pedido.Id_Mesa.HasValue)
        {
            var tieneOtros = await _pedidoRepository.TieneOtrosPedidosAbiertosEnMesaAsync(pedido.Id_Mesa.Value, pedido.Id_Pedido, ct);
            if (!tieneOtros)
            {
                var mesa = await _mesaRepository.ObtenerPorIdAsync(pedido.Id_Mesa.Value, ct);
                if (mesa != null && mesa.Mes_Ocupacion != EstadoOcupacionMesa.Libre)
                {
                    mesa.CambiarOcupacion(EstadoOcupacionMesa.Libre);
                    mesaALiberar = mesa;
                }
            }
        }

        // E. Registrar Auditoría del cobro (RN-95)
        var auditoria = new AuditoriaCobro(
            audUsuario: cajeroNombreUsuario,
            audAccion: "COBRAR_PEDIDO",
            audNumeroPedido: pedido.Ped_NumeroDiario,
            audComprobante: comprobante.ObtenerNumeroFormateado(),
            audMedioPago: metodoNormalizado == "efectivo" ? "Efectivo" : "Yape",
            audTotal: totalReal,
            audMontoRecibido: montoRecibido,
            audVuelto: vuelto,
            audDetalle: $"Cobro exitoso Pedido #{pedido.Ped_NumeroDiario} ({(pedido.Id_Mesa.HasValue ? pedido.Ped_Mesa?.Mes_Nombre ?? "Mesa" : "Para Llevar")}). Comprobante: {comprobante.ObtenerNumeroFormateado()}.",
            audDireccionIp: direccionIp
        );

        // 7. Persistir atómicamente a través del repositorio (RN-88, RNF-39)
        await _ventaRepository.RegistrarCobroTransaccionalAsync(
            venta,
            comprobante,
            pedido,
            mesaALiberar,
            auditoria,
            ct);

        var fechaLocal = TimeZoneHelper.ToPeruTime(comprobante.Com_FechaHoraUtc).ToString("dd/MM/yyyy HH:mm");
        var numFmt = comprobante.ObtenerNumeroFormateado();

        return new CobroResponseDto(
            VentaId: venta.Id_Venta,
            Comprobante: new ComprobanteResumenDto(
                Serie: comprobante.Com_Serie,
                Numero: comprobante.Com_Numero,
                NumeroFormateado: numFmt,
                FechaHoraUtc: comprobante.Com_FechaHoraUtc,
                FechaHoraLocal: fechaLocal
            ),
            Vuelto: vuelto,
            Mensaje: string.Format(MensajesCatalogo.MSG_146, numFmt, totalReal)
        );
    }

    public async Task<ComprobanteDetalleDto> ObtenerComprobanteAsync(Guid ventaId, bool esCopia = false, CancellationToken ct = default)
    {
        var venta = await _ventaRepository.ObtenerPorIdAsync(ventaId, ct);

        if (venta == null || venta.Ven_Comprobante == null)
        {
            throw new KeyNotFoundException("El comprobante o venta solicitada no existe.");
        }

        var comprobante = venta.Ven_Comprobante;
        var pedido = venta.Ven_Pedido;

        var lineasDto = (pedido?.Ped_Detalles ?? Enumerable.Empty<DetallePedido>()).Select(d => new ComprobanteLineaDto(
            Cantidad: d.Det_Cantidad,
            ProductoNombre: d.Det_Producto?.Pro_Nombre ?? "Producto",
            PrecioUnitario: d.Det_PrecioUnitario,
            Subtotal: d.Det_Subtotal,
            Observacion: d.Det_Observacion
        )).ToList().AsReadOnly();

        var fechaHoraLocal = TimeZoneHelper.ToPeruTime(comprobante.Com_FechaHoraUtc).ToString("dd/MM/yyyy HH:mm:ss");

        return new ComprobanteDetalleDto(
            ComprobanteId: comprobante.Id_Comprobante,
            VentaId: venta.Id_Venta,
            Serie: comprobante.Com_Serie,
            Numero: comprobante.Com_Numero,
            NumeroFormateado: comprobante.ObtenerNumeroFormateado(),
            FechaHoraUtc: comprobante.Com_FechaHoraUtc,
            FechaHoraFormateada: fechaHoraLocal,
            PedidoNumero: pedido?.Ped_NumeroDiario ?? 0,
            TipoPedido: pedido?.Ped_Tipo == TipoPedido.ParaLlevar ? "Para Llevar" : "Salón / Mesa",
            MesaNombre: pedido?.Ped_Mesa?.Mes_Nombre,
            Referencia: pedido?.Ped_Notas,
            CajeroNombre: venta.Ven_Usuario?.Usu_Nombre ?? "Cajero",
            Lineas: lineasDto,
            Total: comprobante.Com_Total,
            MetodoPago: comprobante.Com_MetodoPago.ToString(),
            MontoRecibido: venta.Ven_MontoRecibido,
            Vuelto: venta.Ven_Vuelto,
            YapeReferencia: venta.Ven_YapeReferencia,
            Leyenda: comprobante.Com_Leyenda,
            EsCopia: esCopia
        );
    }

    public async Task<byte[]> GenerarComprobantePdfAsync(Guid ventaId, bool esCopia = false, CancellationToken ct = default)
    {
        var detalle = await ObtenerComprobanteAsync(ventaId, esCopia, ct);

        // Generar archivo de texto formateado térmico de 80mm o PDF
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("========================================");
        sb.AppendLine("         RESTAURANTE GIRASOLES          ");
        sb.AppendLine("           RUC: 20481234567             ");
        sb.AppendLine("      Av. Principal 123 - Ayacucho      ");
        sb.AppendLine("========================================");
        if (detalle.EsCopia)
        {
            sb.AppendLine("             *** COPIA ***              ");
        }
        sb.AppendLine($"COMPROBANTE: {detalle.NumeroFormateado}");
        sb.AppendLine($"FECHA/HORA : {detalle.FechaHoraFormateada}");
        sb.AppendLine($"CAJERO(A)  : {detalle.CajeroNombre}");
        sb.AppendLine($"PEDIDO     : N.º {detalle.PedidoNumero} ({detalle.TipoPedido})");
        if (!string.IsNullOrWhiteSpace(detalle.MesaNombre))
        {
            sb.AppendLine($"MESA       : {detalle.MesaNombre}");
        }
        if (!string.IsNullOrWhiteSpace(detalle.Referencia))
        {
            sb.AppendLine($"REF / CLIENTE: {detalle.Referencia}");
        }
        sb.AppendLine("----------------------------------------");
        sb.AppendLine("CANT  DESCRIPCIÓN        P.UNIT  IMPORTE");
        sb.AppendLine("----------------------------------------");
        foreach (var l in detalle.Lineas)
        {
            var nombreCorto = l.ProductoNombre.Length > 18 ? l.ProductoNombre.Substring(0, 18) : l.ProductoNombre;
            sb.AppendLine($"{l.Cantidad,4}  {nombreCorto,-18} {l.PrecioUnitario,6:F2} {l.Subtotal,8:F2}");
            if (!string.IsNullOrWhiteSpace(l.Observacion))
            {
                sb.AppendLine($"      * {l.Observacion}");
            }
        }
        sb.AppendLine("----------------------------------------");
        sb.AppendLine($"TOTAL A PAGAR:               S/ {detalle.Total,8:F2}");
        sb.AppendLine($"MÉTODO PAGO  : {detalle.MetodoPago}");
        if (detalle.MetodoPago == "Efectivo" && detalle.MontoRecibido.HasValue)
        {
            sb.AppendLine($"MONTO RECIBIDO:              S/ {detalle.MontoRecibido.Value,8:F2}");
            sb.AppendLine($"VUELTO ENTREGADO:            S/ {detalle.Vuelto ?? 0,8:F2}");
        }
        else if (detalle.MetodoPago == "Yape" && !string.IsNullOrWhiteSpace(detalle.YapeReferencia))
        {
            sb.AppendLine($"REF. YAPE    : {detalle.YapeReferencia}");
        }
        sb.AppendLine("========================================");
        sb.AppendLine($"    {detalle.Leyenda}    ");
        sb.AppendLine("        ¡GRACIAS POR SU PREFERENCIA!    ");
        sb.AppendLine("========================================");

        return System.Text.Encoding.UTF8.GetBytes(sb.ToString());
    }
}
