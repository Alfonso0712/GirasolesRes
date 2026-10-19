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
    private readonly IPdfComprobanteService _pdfComprobanteService;

    public CobroService(
        ICajaRepository cajaRepository,
        IVentaRepository ventaRepository,
        IComprobanteRepository comprobanteRepository,
        IPedidoRepository pedidoRepository,
        IMesaRepository mesaRepository,
        IAuditoriaCobroRepository auditoriaCobroRepository,
        IPdfComprobanteService pdfComprobanteService)
    {
        _cajaRepository = cajaRepository;
        _ventaRepository = ventaRepository;
        _comprobanteRepository = comprobanteRepository;
        _pedidoRepository = pedidoRepository;
        _mesaRepository = mesaRepository;
        _auditoriaCobroRepository = auditoriaCobroRepository;
        _pdfComprobanteService = pdfComprobanteService;
    }

    public async Task<IReadOnlyList<PedidoPendienteCobroDto>> ObtenerPedidosPendientesCobroAsync(CancellationToken ct = default)
    {
        // RV-95 / RN-84 / RN-108: Validar caja abierta y del día actual
        var cajaAbierta = await ValidarCajaAbiertaParaCobroAsync(ct);

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
            EstaListo: p.Ped_Estado == EstadoPedido.Listo,
            MesaId: p.Id_Mesa
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

        // 2. Precondición: Caja abierta y vigente para la fecha operativa (RV-95, RN-84, RN-108)
        var cajaAbierta = await ValidarCajaAbiertaParaCobroAsync(ct);

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

        // B. Determinar Tipo de Comprobante, Serie y Validaciones SUNAT
        var tipoComprobanteRaw = request.TipoComprobante?.Trim();
        string tipoComprobante;
        string serie;
        string leyenda;
        string? tipoDocReceptor = null;
        string? numDocReceptor = null;
        string? razonSocialReceptor = null;
        string? direccionReceptor = null;

        if (string.Equals(tipoComprobanteRaw, "Factura", StringComparison.OrdinalIgnoreCase))
        {
            tipoComprobante = "Factura";
            serie = "F001";
            leyenda = "Representación impresa de comprobante electrónico";
            tipoDocReceptor = "RUC";

            var ruc = request.NumDocReceptor?.Trim();
            if (string.IsNullOrWhiteSpace(ruc) || ruc.Length != 11 || !ruc.All(char.IsDigit) || (!ruc.StartsWith("10") && !ruc.StartsWith("20")))
            {
                throw new ArgumentException("El RUC debe tener 11 dígitos numéricos y comenzar con 10 o 20.");
            }
            numDocReceptor = ruc;

            var razon = request.RazonSocialReceptor?.Trim();
            if (string.IsNullOrWhiteSpace(razon))
            {
                throw new ArgumentException("La razón social es obligatoria para emitir una Factura.");
            }
            razonSocialReceptor = razon;
            direccionReceptor = string.IsNullOrWhiteSpace(request.DireccionReceptor) ? null : request.DireccionReceptor.Trim();
        }
        else if (string.Equals(tipoComprobanteRaw, "Boleta", StringComparison.OrdinalIgnoreCase))
        {
            tipoComprobante = "Boleta";
            serie = "B001";
            leyenda = "Representación impresa de comprobante electrónico";

            var dni = request.NumDocReceptor?.Trim();
            if (!string.IsNullOrWhiteSpace(dni))
            {
                if (dni.Length != 8 || !dni.All(char.IsDigit))
                {
                    throw new ArgumentException("El DNI debe contener exactamente 8 dígitos numéricos.");
                }
                tipoDocReceptor = "DNI";
                numDocReceptor = dni;
                razonSocialReceptor = string.IsNullOrWhiteSpace(request.RazonSocialReceptor) ? null : request.RazonSocialReceptor.Trim();
            }
            else
            {
                // Boleta Simple
                if (totalReal >= 700.00m)
                {
                    throw new ArgumentException("Por normativa SUNAT, ventas iguales o superiores a S/ 700.00 requieren DNI o RUC.");
                }
                tipoDocReceptor = null;
                numDocReceptor = null;
                razonSocialReceptor = "CLIENTES VARIOS";
            }
        }
        else
        {
            // Ticket Interno por defecto
            tipoComprobante = "Ticket";
            serie = "T001";
            leyenda = "Documento sin validez tributaria";
            tipoDocReceptor = null;
            numDocReceptor = null;
            razonSocialReceptor = null;
        }

        var opGravada = decimal.Round(totalReal / 1.18m, 2);
        var igv = totalReal - opGravada;

        var siguienteNumero = await _comprobanteRepository.ObtenerSiguienteNumeroCorrelativoAsync(serie, ct);
        var comprobante = new Comprobante(
            idVenta: venta.Id_Venta,
            comNumero: siguienteNumero,
            comTotal: totalReal,
            comMetodoPago: metodoPago,
            comSerie: serie,
            comTipo: tipoComprobante,
            comLeyenda: leyenda,
            comTipoDocReceptor: tipoDocReceptor,
            comNumDocReceptor: numDocReceptor,
            comRazonSocialReceptor: razonSocialReceptor,
            comDireccionReceptor: direccionReceptor,
            comOpGravada: opGravada,
            comIgv: igv
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
            TipoComprobante: comprobante.Com_Tipo,
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
            OpGravada: comprobante.Com_OpGravada,
            Igv: comprobante.Com_Igv,
            MetodoPago: comprobante.Com_MetodoPago.ToString(),
            MontoRecibido: venta.Ven_MontoRecibido,
            Vuelto: venta.Ven_Vuelto,
            YapeReferencia: venta.Ven_YapeReferencia,
            Leyenda: comprobante.Com_Leyenda,
            TipoDocReceptor: comprobante.Com_TipoDocReceptor,
            NumDocReceptor: comprobante.Com_NumDocReceptor,
            RazonSocialReceptor: comprobante.Com_RazonSocialReceptor,
            DireccionReceptor: comprobante.Com_DireccionReceptor,
            EsCopia: esCopia
        );
    }

    public async Task<byte[]> GenerarComprobantePdfAsync(Guid ventaId, bool esCopia = false, CancellationToken ct = default)
    {
        var detalle = await ObtenerComprobanteAsync(ventaId, esCopia, ct);
        return _pdfComprobanteService.GenerarPdfComprobante(detalle);
    }

    private async Task<Caja> ValidarCajaAbiertaParaCobroAsync(CancellationToken ct)
    {
        // 1. Debe haber caja abierta (RV-95, RN-84, MSG-135, E-294)
        var cajaAbierta = await _cajaRepository.ObtenerCajaAbiertaActualAsync(ct);
        if (cajaAbierta == null)
        {
            throw new CobroConflictException("caja_cerrada", MensajesCatalogo.MSG_135);
        }

        // 2. Si la caja abierta es de un día anterior en horario de Lima (UTC-5), bloquear cobros (RN-108, MSG-168, E-291)
        var hoyLima = TimeZoneHelper.ObtenerFechaActualLima();
        var fechaAperturaLima = TimeZoneHelper.GetFechaOperativa(cajaAbierta.Caj_FechaAperturaUtc);

        if (fechaAperturaLima < hoyLima)
        {
            var fechaStr = TimeZoneHelper.ToPeruTime(cajaAbierta.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy");
            var mensaje = string.Format(MensajesCatalogo.MSG_168, fechaStr);
            throw new CobroConflictException("caja_cerrada", mensaje);
        }

        return cajaAbierta;
    }
}
