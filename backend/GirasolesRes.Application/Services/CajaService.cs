using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Domain.Exceptions;

namespace GirasolesRes.Application.Services;

public class CajaService : ICajaService
{
    private readonly ICajaRepository _cajaRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IPdfCierreService _pdfCierreService;

    public CajaService(
        ICajaRepository cajaRepository,
        IPedidoRepository pedidoRepository,
        IPdfCierreService pdfCierreService)
    {
        _cajaRepository = cajaRepository;
        _pedidoRepository = pedidoRepository;
        _pdfCierreService = pdfCierreService;
    }

    public async Task<CajaEstadoResponseDto> ConsultarEstadoActualAsync(Guid? usuarioId = null, CancellationToken ct = default)
    {
        var hoyLima = TimeZoneHelper.ObtenerFechaHoraActualLima();

        // 1. Detectar caja de día anterior sin cerrar (RN-108, MSG-168, E-291)
        var cajaAnterior = await _cajaRepository.ObtenerCajaAnteriorSinCerrarAsync(hoyLima, ct);
        if (cajaAnterior != null)
        {
            var fechaAperturaLocal = TimeZoneHelper.ToPeruTime(cajaAnterior.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");
            var fechaAperturaDia = TimeZoneHelper.ToPeruTime(cajaAnterior.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy");

            var ventasParciales = await _cajaRepository.ObtenerVentasPorCajaIdAsync(cajaAnterior.Id_Caja, ct);
            var totalEfectivo = decimal.Round(ventasParciales.Where(v => v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total), 2);
            var totalYape = decimal.Round(ventasParciales.Where(v => v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total), 2);

            var ultimaCerrada = await _cajaRepository.ObtenerUltimaCajaCerradaAsync(ct);

            return new CajaEstadoResponseDto(
                Estado: "anteriorSinCerrar",
                Mensaje: string.Format(MensajesCatalogo.MSG_168, fechaAperturaDia),
                Apertura: new AperturaActualDto(
                    CajaId: cajaAnterior.Id_Caja,
                    FechaApertura: cajaAnterior.Caj_FechaAperturaUtc,
                    FechaAperturaLocal: fechaAperturaLocal,
                    MontoInicial: cajaAnterior.Caj_MontoApertura,
                    IdUsuarioApertura: cajaAnterior.Id_Usuario,
                    NombreUsuarioApertura: cajaAnterior.Caj_Usuario?.Usu_Nombre ?? "Cajero"
                ),
                ResumenParcial: new ResumenParcialDto(
                    TotalVentas: decimal.Round(totalEfectivo + totalYape, 2),
                    TotalEfectivo: totalEfectivo,
                    TotalYape: totalYape,
                    CantidadVentas: ventasParciales.Count
                ),
                SugerenciaMontoInicial: ultimaCerrada?.Caj_MontoCierre ?? 0.00m
            );
        }

        // 2. Detectar caja abierta actualmente
        var cajaAbierta = await _cajaRepository.ObtenerCajaAbiertaAsync(ct);
        if (cajaAbierta != null)
        {
            var fechaAperturaLocal = TimeZoneHelper.ToPeruTime(cajaAbierta.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");

            var ventasParciales = await _cajaRepository.ObtenerVentasPorCajaIdAsync(cajaAbierta.Id_Caja, ct);
            var totalEfectivo = decimal.Round(ventasParciales.Where(v => v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total), 2);
            var totalYape = decimal.Round(ventasParciales.Where(v => v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total), 2);

            return new CajaEstadoResponseDto(
                Estado: "abierta",
                Mensaje: null,
                Apertura: new AperturaActualDto(
                    CajaId: cajaAbierta.Id_Caja,
                    FechaApertura: cajaAbierta.Caj_FechaAperturaUtc,
                    FechaAperturaLocal: fechaAperturaLocal,
                    MontoInicial: cajaAbierta.Caj_MontoApertura,
                    IdUsuarioApertura: cajaAbierta.Id_Usuario,
                    NombreUsuarioApertura: cajaAbierta.Caj_Usuario?.Usu_Nombre ?? "Cajero"
                ),
                ResumenParcial: new ResumenParcialDto(
                    TotalVentas: decimal.Round(totalEfectivo + totalYape, 2),
                    TotalEfectivo: totalEfectivo,
                    TotalYape: totalYape,
                    CantidadVentas: ventasParciales.Count
                ),
                SugerenciaMontoInicial: cajaAbierta.Caj_MontoApertura
            );
        }

        // 3. No hay caja abierta (sinCaja, E-286)
        var ultimaCajaCerrada = await _cajaRepository.ObtenerUltimaCajaCerradaAsync(ct);
        decimal sugerencia = ultimaCajaCerrada?.Caj_MontoCierre ?? 0.00m;

        return new CajaEstadoResponseDto(
            Estado: "sinCaja",
            Mensaje: MensajesCatalogo.MSG_166,
            Apertura: null,
            ResumenParcial: null,
            SugerenciaMontoInicial: sugerencia
        );
    }

    public Task<CajaEstadoResponseDto> ObtenerCajaActualAsync(CancellationToken ct = default)
    {
        return ConsultarEstadoActualAsync(null, ct);
    }

    public async Task<CajaResponseDto> AbrirCajaAsync(AbrirCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default)
    {
        // 1. Idempotencia por solicitudId (RV-121, RNF-45, E-292)
        if (!string.IsNullOrWhiteSpace(dto.SolicitudId))
        {
            var existente = await _cajaRepository.ObtenerPorSolicitudIdAsync(dto.SolicitudId.Trim(), ct);
            if (existente != null)
            {
                var fechaLocalExistente = TimeZoneHelper.ToPeruTime(existente.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");
                var msgExistente = string.Format(MensajesCatalogo.MSG_173, existente.Caj_MontoApertura);
                return new CajaResponseDto(
                    CajaId: existente.Id_Caja,
                    MontoInicial: existente.Caj_MontoApertura,
                    FechaApertura: existente.Caj_FechaAperturaUtc,
                    FechaAperturaUtc: existente.Caj_FechaAperturaUtc,
                    FechaAperturaLocal: fechaLocalExistente,
                    Estado: "abierta",
                    Mensaje: msgExistente,
                    Message: msgExistente,
                    SolicitudId: existente.Caj_SolicitudId ?? dto.SolicitudId.Trim(),
                    IdUsuarioApertura: existente.Id_Usuario,
                    NombreUsuarioApertura: existente.Caj_Usuario?.Usu_Nombre ?? nombreUsuario,
                    Caja: new CajaDetalleAperturaDto(existente.Id_Caja, existente.Caj_MontoApertura)
                );
            }
        }

        // 2. Validar que no haya caja anterior sin cerrar (RN-108, MSG-168, E-291)
        var hoyLima = TimeZoneHelper.ObtenerFechaHoraActualLima();
        var cajaAnterior = await _cajaRepository.ObtenerCajaAnteriorSinCerrarAsync(hoyLima, ct);
        if (cajaAnterior != null)
        {
            var fechaAperturaDia = TimeZoneHelper.ToPeruTime(cajaAnterior.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy");
            throw new CajaAnteriorSinCerrarException(
                cajaAnterior.Id_Caja,
                cajaAnterior.Caj_FechaAperturaUtc,
                fechaAperturaDia,
                string.Format(MensajesCatalogo.MSG_168, fechaAperturaDia)
            );
        }

        // 3. Validar unicidad: solo una caja abierta en el sistema (RV-119, RN-107, MSG-167, E-290)
        var cajaAbierta = await _cajaRepository.ObtenerCajaAbiertaAsync(ct);
        if (cajaAbierta != null)
        {
            throw new CajaYaAbiertaException(
                MensajesCatalogo.MSG_167,
                cajaAbierta.Id_Caja,
                cajaAbierta.Caj_FechaAperturaUtc,
                cajaAbierta.Caj_Usuario?.Usu_Nombre
            );
        }

        // 4. Validar monto inicial monetario (RV-120, MSG-169, MSG-170, MSG-171, E-289)
        if (!dto.MontoInicial.HasValue)
        {
            throw new CajaMontoInvalidoException(0m, "MontoInicial", MensajesCatalogo.MSG_169);
        }

        var monto = dto.MontoInicial.Value;
        if (monto < 0.00m)
        {
            throw new CajaMontoInvalidoException(monto, "MontoInicial", MensajesCatalogo.MSG_170);
        }

        if (monto > 99999.99m)
        {
            throw new CajaMontoInvalidoException(monto, "MontoInicial", MensajesCatalogo.MSG_171);
        }

        if (decimal.Round(monto, 2) != monto)
        {
            throw new CajaMontoInvalidoException(monto, "MontoInicial", MensajesCatalogo.MSG_170);
        }

        // 5. Instanciar y persistir entidad
        var nuevaCaja = new Caja(usuarioId, monto, dto.SolicitudId);
        try
        {
            await _cajaRepository.AgregarAsync(nuevaCaja, ct);
        }
        catch (CajaYaAbiertaException)
        {
            throw;
        }
        catch (Exception ex) when (IsUniqueIndexViolation(ex))
        {
            var cajaAbiertaActual = await _cajaRepository.ObtenerCajaAbiertaAsync(ct);
            throw new CajaYaAbiertaException(
                MensajesCatalogo.MSG_167,
                cajaAbiertaActual?.Id_Caja,
                cajaAbiertaActual?.Caj_FechaAperturaUtc,
                cajaAbiertaActual?.Caj_Usuario?.Usu_Nombre
            );
        }

        var fechaLocal = TimeZoneHelper.ToPeruTime(nuevaCaja.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");
        var mensajeExito = string.Format(MensajesCatalogo.MSG_173, nuevaCaja.Caj_MontoApertura);

        return new CajaResponseDto(
            CajaId: nuevaCaja.Id_Caja,
            MontoInicial: nuevaCaja.Caj_MontoApertura,
            FechaApertura: nuevaCaja.Caj_FechaAperturaUtc,
            FechaAperturaUtc: nuevaCaja.Caj_FechaAperturaUtc,
            FechaAperturaLocal: fechaLocal,
            Estado: "abierta",
            Mensaje: mensajeExito,
            Message: mensajeExito,
            SolicitudId: nuevaCaja.Caj_SolicitudId!,
            IdUsuarioApertura: nuevaCaja.Id_Usuario,
            NombreUsuarioApertura: nombreUsuario,
            Caja: new CajaDetalleAperturaDto(nuevaCaja.Id_Caja, nuevaCaja.Caj_MontoApertura)
        );
    }

    public Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(CancellationToken ct = default)
    {
        return ObtenerResumenCierreAsync(Guid.Empty, ct);
    }

    public async Task<ResumenCierreResponseDto> ObtenerResumenCierreAsync(Guid usuarioId, CancellationToken ct = default)
    {
        // 1. Verificar caja abierta
        var caja = await _cajaRepository.ObtenerCajaAbiertaAsync(ct);
        if (caja == null)
        {
            throw new CajaNoAbiertaException(MensajesCatalogo.MSG_166);
        }

        // 2. Obtener pedidos pendientes de cobro (RV-122, RN-110, MSG-174)
        var fechaOperativaCaja = TimeZoneHelper.GetFechaOperativa(caja.Caj_FechaAperturaUtc);
        var pedidosPendientesEntidades = (await _pedidoRepository.ListarPedidosPendientesCobroAsync(fechaOperativaCaja, ct))
            .Where(p => p.Ped_FechaOperativa == fechaOperativaCaja)
            .ToList();
        var pedidosPendientesDto = pedidosPendientesEntidades.Select(p => new PedidoPendienteCierreDto(
            PedidoId: p.Id_Pedido,
            Numero: p.Ped_NumeroDiario,
            Tipo: p.Ped_Tipo == TipoPedido.ParaLlevar ? "Para Llevar" : "Mesa",
            Mesa: p.Ped_Mesa?.Mes_Nombre ?? "Mostrador",
            Total: p.Ped_Total
        )).ToList();

        // 3. Obtener ventas vigentes de la caja actual (excluyendo anuladas, RV-123, RN-109, E-299)
        var ventas = await _cajaRepository.ObtenerVentasPorCajaIdAsync(caja.Id_Caja, ct);

        var ventasEfectivo = decimal.Round(ventas.Where(v => v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total), 2);
        var ventasYape = decimal.Round(ventas.Where(v => v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total), 2);
        var totalVentas = decimal.Round(ventasEfectivo + ventasYape, 2);
        var cantidadVentas = ventas.Count;

        // Fórmula: efectivoEsperado = montoInicial + ventasEfectivo (Yape no ingresa a caja física)
        var efectivoEsperado = decimal.Round(caja.Caj_MontoApertura + ventasEfectivo, 2);

        // 4. Desglose en 3 bloques (D-017, RN-138, E-401): Carta, Menús Completos y Componentes
        var todosDetalles = ventas
            .SelectMany(v => v.Ven_Pedido?.Ped_Detalles ?? Enumerable.Empty<DetallePedido>())
            .ToList();

        // Bloque 1: Productos de carta (cantidad y monto)
        var productosCarta = todosDetalles
            .Where(d => !d.Id_MenuCompleto.HasValue)
            .GroupBy(d => d.Det_Producto?.Pro_Nombre ?? d.Det_Nombre ?? "Producto")
            .Select(g => new PlatoVendidoResumenDto(
                Nombre: g.Key,
                Cantidad: g.Sum(d => d.Det_Cantidad),
                Total: decimal.Round(g.Sum(d => d.Det_Subtotal), 2)
            ))
            .OrderByDescending(p => p.Cantidad)
            .ThenBy(p => p.Nombre)
            .ToList();

        // Bloque 2: Menús completos (cantidad y monto)
        var menusCompletos = todosDetalles
            .Where(d => d.Id_MenuCompleto.HasValue)
            .GroupBy(d => d.Id_MenuCompleto!.Value)
            .Select(g =>
            {
                var first = g.First();
                var nombre = !string.IsNullOrWhiteSpace(first.Det_Nombre)
                    ? first.Det_Nombre
                    : first.Det_MenuCompleto?.Men_Nombre ?? $"Menú #{g.Key}";
                return new MenuCompletoCierreDto(
                    MenuCompletoId: g.Key,
                    Nombre: nombre,
                    Cantidad: g.Sum(d => d.Det_Cantidad),
                    Monto: decimal.Round(g.Sum(d => d.Det_Subtotal), 2)
                );
            })
            .OrderByDescending(m => m.Cantidad)
            .ThenBy(m => m.Nombre)
            .ToList();

        // Bloque 3: Componentes elegidos en menús (veces elegidas, sin monto según RN-138)
        var componentes = todosDetalles
            .Where(d => d.Id_MenuCompleto.HasValue)
            .SelectMany(d => d.Det_Opciones.Select(o => new { Opcion = o, Cantidad = d.Det_Cantidad }))
            .GroupBy(x => x.Opcion.Id_Producto)
            .Select(g =>
            {
                var first = g.First().Opcion;
                return new ComponenteCierreDto(
                    ProductoId: g.Key,
                    Producto: first.Lpo_ProductoNombre,
                    Rol: first.Lpo_ParteNombre,
                    Cantidad: g.Sum(x => x.Cantidad)
                );
            })
            .OrderByDescending(c => c.Cantidad)
            .ThenBy(c => c.Producto)
            .ToList();

        var fechaAperturaLocal = TimeZoneHelper.ToPeruTime(caja.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");

        return new ResumenCierreResponseDto(
            CajaId: caja.Id_Caja,
            FechaApertura: caja.Caj_FechaAperturaUtc,
            FechaAperturaLocal: fechaAperturaLocal,
            MontoInicial: caja.Caj_MontoApertura,
            VentasEfectivo: ventasEfectivo,
            Efectivo: ventasEfectivo,
            VentasYape: ventasYape,
            Yape: ventasYape,
            TotalVentas: totalVentas,
            Total: totalVentas,
            EfectivoEsperado: efectivoEsperado,
            CantidadVentas: cantidadVentas,
            PlatosVendidos: productosCarta,
            PedidosPendientes: pedidosPendientesDto,
            MenusCompletos: menusCompletos,
            Componentes: componentes,
            ProductosCarta: productosCarta
        );
    }

    public async Task<CierreResponseDto> CerrarCajaAsync(CerrarCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default)
    {
        // 1. Idempotencia por solicitudId de cierre (RV-127, RNF-45, E-309)
        if (!string.IsNullOrWhiteSpace(dto.SolicitudId))
        {
            var existente = await _cajaRepository.ObtenerPorSolicitudIdAsync(dto.SolicitudId.Trim(), ct);
            if (existente != null && existente.Caj_Estado == EstadoCaja.Cerrada)
            {
                var fechaCierreLocal = existente.Caj_FechaCierreUtc.HasValue
                    ? TimeZoneHelper.ToPeruTime(existente.Caj_FechaCierreUtc.Value).ToString("dd/MM/yyyy HH:mm")
                    : null;

                var estadoCuadreExistente = existente.ObtenerEstadoCuadre()?.ToString() ?? "Cuadra";
                var mensajeExistente = ConstruirMensajeCuadre(existente.Caj_Diferencia ?? 0.00m);

                return new CierreResponseDto(
                    CajaId: existente.Id_Caja,
                    CierreId: existente.Id_Caja,
                    Id: existente.Id_Caja,
                    MontoInicial: existente.Caj_MontoApertura,
                    EfectivoEsperado: existente.Caj_MontoEsperado ?? 0.00m,
                    EfectivoContado: existente.Caj_MontoCierre ?? 0.00m,
                    Diferencia: existente.Caj_Diferencia ?? 0.00m,
                    EstadoCuadre: estadoCuadreExistente,
                    Mensaje: mensajeExistente,
                    Message: mensajeExistente,
                    FechaCierreUtc: existente.Caj_FechaCierreUtc,
                    FechaCierreLocal: fechaCierreLocal,
                    SolicitudId: existente.Caj_SolicitudIdCierre ?? dto.SolicitudId.Trim()
                );
            }
        }

        // 2. Precondición: debe haber caja abierta (E-306)
        var caja = await _cajaRepository.ObtenerCajaAbiertaAsync(ct);
        if (caja == null)
        {
            throw new CajaNoAbiertaException(MensajesCatalogo.MSG_166);
        }

        if (caja.Caj_Estado != EstadoCaja.Abierta)
        {
            throw new CajaYaCerradaException(caja.Id_Caja);
        }

        // 3. Precondición: no debe haber pedidos pendientes de cobro (RV-122, RN-110, MSG-174, E-296)
        var fechaOperativaCaja = TimeZoneHelper.GetFechaOperativa(caja.Caj_FechaAperturaUtc);
        var pedidosPendientes = (await _pedidoRepository.ListarPedidosPendientesCobroAsync(fechaOperativaCaja, ct))
            .Where(p => p.Ped_FechaOperativa == fechaOperativaCaja)
            .ToList();
        if (pedidosPendientes.Count > 0)
        {
            throw new CajaPedidosPendientesException(
                pedidosPendientes.Count,
                MensajesCatalogo.MSG_174
            );
        }

        // 4. Validar efectivo contado (RV-124, MSG-175, MSG-170, MSG-171, E-303)
        if (!dto.EfectivoContado.HasValue)
        {
            throw new CajaMontoInvalidoException(0m, "EfectivoContado", MensajesCatalogo.MSG_175);
        }

        var contado = dto.EfectivoContado.Value;
        if (contado < 0.00m)
        {
            throw new CajaMontoInvalidoException(contado, "EfectivoContado", MensajesCatalogo.MSG_170);
        }

        if (contado > 99999.99m)
        {
            throw new CajaMontoInvalidoException(contado, "EfectivoContado", MensajesCatalogo.MSG_171);
        }

        if (decimal.Round(contado, 2) != contado)
        {
            throw new CajaMontoInvalidoException(contado, "EfectivoContado", MensajesCatalogo.MSG_170);
        }

        // 5. Validar observación (RV-126, MSG-179, E-305)
        if (!string.IsNullOrWhiteSpace(dto.Observacion) && dto.Observacion.Trim().Length > 200)
        {
            throw new CajaObservacionInvalidaException(dto.Observacion.Trim().Length, 200, MensajesCatalogo.MSG_179);
        }

        // 6. Calcular totales fidedignos del turno desde ventas vigentes (RV-123, RN-109, E-298)
        var ventas = await _cajaRepository.ObtenerVentasPorCajaIdAsync(caja.Id_Caja, ct);

        var ventasEfectivo = decimal.Round(ventas.Where(v => v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total), 2);
        var ventasYape = decimal.Round(ventas.Where(v => v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total), 2);
        var totalVentas = decimal.Round(ventasEfectivo + ventasYape, 2);
        var cantidadVentas = ventas.Count;
        var efectivoEsperado = decimal.Round(caja.Caj_MontoApertura + ventasEfectivo, 2);

        // 7. Chequeo de concurrencia: si el esperado mostrado cambió mientras contaba, abortar (RV-129, MSG-189, E-308)
        if (dto.EfectivoEsperadoMostrado.HasValue)
        {
            var mostrado = decimal.Round(dto.EfectivoEsperadoMostrado.Value, 2);
            if (mostrado != efectivoEsperado)
            {
                throw new CajaConcurrenciaException(
                    efectivoEsperadoActual: efectivoEsperado,
                    efectivoEsperadoMostrado: mostrado,
                    mensaje: MensajesCatalogo.MSG_189
                );
            }
        }

        // 8. Ejecutar cierre de dominio en la entidad
        caja.Cerrar(
            idUsuarioCierre: usuarioId,
            efectivoContado: contado,
            efectivoEsperado: efectivoEsperado,
            totalVentasEfectivo: ventasEfectivo,
            totalVentasYape: ventasYape,
            totalVentas: totalVentas,
            cantidadVentas: cantidadVentas,
            observacion: dto.Observacion,
            solicitudIdCierre: dto.SolicitudId
        );

        // 9. Persistir atómicamente
        try
        {
            await _cajaRepository.ActualizarAsync(caja, ct);
        }
        catch (CajaYaCerradaException)
        {
            throw;
        }
        catch (Exception ex) when (IsConcurrencyViolation(ex))
        {
            throw new CajaYaCerradaException(caja.Id_Caja, MensajesCatalogo.MSG_183);
        }

        // 10. Construir respuesta
        var diferencia = caja.Caj_Diferencia!.Value;
        var estadoCuadre = caja.ObtenerEstadoCuadre()?.ToString() ?? "Cuadra";
        var mensaje = ConstruirMensajeCuadre(diferencia);
        var fechaCierreLocalFinal = TimeZoneHelper.ToPeruTime(caja.Caj_FechaCierreUtc!.Value).ToString("dd/MM/yyyy HH:mm");

        return new CierreResponseDto(
            CajaId: caja.Id_Caja,
            CierreId: caja.Id_Caja,
            Id: caja.Id_Caja,
            MontoInicial: caja.Caj_MontoApertura,
            EfectivoEsperado: efectivoEsperado,
            EfectivoContado: contado,
            Diferencia: diferencia,
            EstadoCuadre: estadoCuadre,
            Mensaje: mensaje,
            Message: mensaje,
            FechaCierreUtc: caja.Caj_FechaCierreUtc,
            FechaCierreLocal: fechaCierreLocalFinal,
            SolicitudId: caja.Caj_SolicitudIdCierre
        );
    }

    public async Task<HistorialCierresPaginadoDto> ObtenerHistorialCierresAsync(DateTime? desde, DateTime? hasta, int pagina, int tamano, CancellationToken ct = default)
    {
        var hoyLima = TimeZoneHelper.ObtenerFechaActualLima();

        // 1. Validar filtros temporales (RV-130, MSG-188, E-315)
        if (desde.HasValue && hasta.HasValue && desde.Value.Date > hasta.Value.Date)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_188);
        }

        if (desde.HasValue && DateOnly.FromDateTime(desde.Value) > hoyLima)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_188);
        }

        if (hasta.HasValue && DateOnly.FromDateTime(hasta.Value) > hoyLima)
        {
            throw new ArgumentException(MensajesCatalogo.MSG_188);
        }

        // 2. Sanitizar paginación
        var pag = Math.Max(1, pagina);
        var tam = tamano <= 0 ? 20 : tamano;

        // 3. Consultar repositorio
        var (items, total) = await _cajaRepository.ObtenerHistorialPaginadoAsync(desde, hasta, pag, tam, ct);

        // 4. Mapear resultados
        var itemsDto = items.Select(c =>
        {
            var fechaAperturaLocal = TimeZoneHelper.ToPeruTime(c.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");
            var fechaCierreLocal = c.Caj_FechaCierreUtc.HasValue
                ? TimeZoneHelper.ToPeruTime(c.Caj_FechaCierreUtc.Value).ToString("dd/MM/yyyy HH:mm")
                : null;

            string estadoStr = c.Caj_Estado == EstadoCaja.Abierta ? "Abierta" : "Cerrada";
            string? resultado = null;
            if (c.Caj_Estado == EstadoCaja.Cerrada && c.Caj_Diferencia.HasValue)
            {
                resultado = c.Caj_Diferencia.Value == 0.00m ? "cuadra" : (c.Caj_Diferencia.Value > 0.00m ? "sobrante" : "faltante");
            }

            // RV-131 / RN-113: Detectar si hubo ventas anuladas en esta caja ("Con ajustes")
            bool tieneAjustes = c.Caj_Ventas.Any(v => v.Ven_Estado == EstadoVenta.Anulada);

            var cajeroNombre = c.Caj_Usuario?.Usu_Nombre ?? "Cajero";

            decimal ventasEfectivo;
            decimal ventasYape;
            decimal totalVentas;
            decimal? efectivoEsperado;

            if (c.Caj_Estado == EstadoCaja.Abierta)
            {
                var ventasVigentes = c.Caj_Ventas.Where(v => v.Ven_Estado == EstadoVenta.Vigente).ToList();
                ventasEfectivo = decimal.Round(ventasVigentes.Where(v => v.Ven_MetodoPago == MetodoPago.Efectivo).Sum(v => v.Ven_Total), 2);
                ventasYape = decimal.Round(ventasVigentes.Where(v => v.Ven_MetodoPago == MetodoPago.Yape).Sum(v => v.Ven_Total), 2);
                totalVentas = decimal.Round(ventasEfectivo + ventasYape, 2);
                efectivoEsperado = decimal.Round(c.Caj_MontoApertura + ventasEfectivo, 2);
            }
            else
            {
                ventasEfectivo = c.Caj_TotalVentasEfectivo ?? 0.00m;
                ventasYape = c.Caj_TotalVentasYape ?? 0.00m;
                totalVentas = c.Caj_TotalVentas ?? 0.00m;
                efectivoEsperado = c.Caj_MontoEsperado;
            }

            return new CierreItemHistorialDto(
                Id: c.Id_Caja,
                CajaId: c.Id_Caja,
                CierreId: c.Id_Caja,
                FechaApertura: c.Caj_FechaAperturaUtc,
                FechaAperturaLocal: fechaAperturaLocal,
                FechaCierre: c.Caj_FechaCierreUtc,
                FechaCierreLocal: fechaCierreLocal,
                Cajero: cajeroNombre,
                CajeroApertura: cajeroNombre,
                CajeroCierre: c.Caj_UsuarioCierre?.Usu_Nombre,
                MontoInicial: c.Caj_MontoApertura,
                MontoCierre: c.Caj_MontoCierre,
                EfectivoContado: c.Caj_MontoCierre,
                EfectivoEsperado: efectivoEsperado,
                Diferencia: c.Caj_Diferencia,
                VentasEfectivo: ventasEfectivo,
                VentasYape: ventasYape,
                TotalVentas: totalVentas,
                Estado: estadoStr,
                Resultado: resultado,
                TieneAjustesPosteriores: tieneAjustes,
                ConAjustes: tieneAjustes,
                Observacion: c.Caj_Observacion
            );
        }).ToList();

        var totalPaginas = (int)Math.Ceiling((double)total / tam);
        string? mensajeResultado = total == 0 ? MensajesCatalogo.MSG_185 : null;

        return new HistorialCierresPaginadoDto(
            Items: itemsDto,
            Total: total,
            Pagina: pag,
            Tamano: tam,
            TotalPaginas: totalPaginas,
            Mensaje: mensajeResultado
        );
    }

    public async Task<CierreDetalleDto> ObtenerDetalleCierreAsync(Guid id, CancellationToken ct = default)
    {
        var caja = await _cajaRepository.ObtenerPorIdConDetallesAsync(id, ct);
        if (caja == null)
        {
            throw new KeyNotFoundException("No se encontró el registro de caja solicitado.");
        }

        var fechaAperturaLocal = TimeZoneHelper.ToPeruTime(caja.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");
        var fechaCierreLocal = caja.Caj_FechaCierreUtc.HasValue
            ? TimeZoneHelper.ToPeruTime(caja.Caj_FechaCierreUtc.Value).ToString("dd/MM/yyyy HH:mm")
            : null;

        // Desglose en 3 bloques de ventas vigentes (D-017, RN-138, E-401)
        var todosDetalles = caja.Caj_Ventas
            .Where(v => v.Ven_Estado == EstadoVenta.Vigente)
            .SelectMany(v => v.Ven_Pedido?.Ped_Detalles ?? Enumerable.Empty<DetallePedido>())
            .ToList();

        // Bloque 1: Productos de carta (cantidad y monto)
        var productosCarta = todosDetalles
            .Where(d => !d.Id_MenuCompleto.HasValue)
            .GroupBy(d => d.Det_Producto?.Pro_Nombre ?? d.Det_Nombre ?? "Producto")
            .Select(g => new PlatoVendidoResumenDto(
                Nombre: g.Key,
                Cantidad: g.Sum(d => d.Det_Cantidad),
                Total: decimal.Round(g.Sum(d => d.Det_Subtotal), 2)
            ))
            .OrderByDescending(p => p.Cantidad)
            .ThenBy(p => p.Nombre)
            .ToList();

        // Bloque 2: Menús completos (cantidad y monto)
        var menusCompletos = todosDetalles
            .Where(d => d.Id_MenuCompleto.HasValue)
            .GroupBy(d => d.Id_MenuCompleto!.Value)
            .Select(g =>
            {
                var first = g.First();
                var nombre = !string.IsNullOrWhiteSpace(first.Det_Nombre)
                    ? first.Det_Nombre
                    : first.Det_MenuCompleto?.Men_Nombre ?? $"Menú #{g.Key}";
                return new MenuCompletoCierreDto(
                    MenuCompletoId: g.Key,
                    Nombre: nombre,
                    Cantidad: g.Sum(d => d.Det_Cantidad),
                    Monto: decimal.Round(g.Sum(d => d.Det_Subtotal), 2)
                );
            })
            .OrderByDescending(m => m.Cantidad)
            .ThenBy(m => m.Nombre)
            .ToList();

        // Bloque 3: Componentes elegidos en menús (veces elegidas, sin monto)
        var componentes = todosDetalles
            .Where(d => d.Id_MenuCompleto.HasValue)
            .SelectMany(d => d.Det_Opciones.Select(o => new { Opcion = o, Cantidad = d.Det_Cantidad }))
            .GroupBy(x => x.Opcion.Id_Producto)
            .Select(g =>
            {
                var first = g.First().Opcion;
                return new ComponenteCierreDto(
                    ProductoId: g.Key,
                    Producto: first.Lpo_ProductoNombre,
                    Rol: first.Lpo_ParteNombre,
                    Cantidad: g.Sum(x => x.Cantidad)
                );
            })
            .OrderByDescending(c => c.Cantidad)
            .ThenBy(c => c.Producto)
            .ToList();

        var platosVendidos = productosCarta;

        // Ajustes posteriores (ventas anuladas en esta caja, RN-113, E-317)
        var ajustesPosteriores = caja.Caj_Ventas
            .Where(v => v.Ven_Estado == EstadoVenta.Anulada)
            .OrderByDescending(v => v.Ven_FechaHoraAnulacionUtc ?? v.Ven_FechaHoraUtc)
            .Select(v => new AjustePosteriorDto(
                VentaId: v.Id_Venta,
                Comprobante: v.Ven_Comprobante?.ObtenerNumeroFormateado() ?? "T001-000000",
                FechaVentaUtc: v.Ven_FechaHoraUtc,
                FechaVentaLocal: TimeZoneHelper.ToPeruTime(v.Ven_FechaHoraUtc).ToString("dd/MM/yyyy HH:mm"),
                FechaAnulacion: v.Ven_FechaHoraAnulacionUtc,
                FechaAnulacionUtc: v.Ven_FechaHoraAnulacionUtc,
                FechaAnulacionLocal: v.Ven_FechaHoraAnulacionUtc.HasValue
                    ? TimeZoneHelper.ToPeruTime(v.Ven_FechaHoraAnulacionUtc.Value).ToString("dd/MM/yyyy HH:mm")
                    : null,
                Total: v.Ven_Total,
                MetodoPago: v.Ven_MetodoPago.ToString(),
                Motivo: v.Ven_MotivoAnulacion,
                UsuarioAnulacion: v.Ven_UsuarioAnulacion
            ))
            .ToList();

        var estadoCuadre = caja.ObtenerEstadoCuadre()?.ToString();
        string? resultado = null;
        if (caja.Caj_Estado == EstadoCaja.Cerrada && caja.Caj_Diferencia.HasValue)
        {
            resultado = caja.Caj_Diferencia.Value == 0.00m ? "cuadra" : (caja.Caj_Diferencia.Value > 0.00m ? "sobrante" : "faltante");
        }

        return new CierreDetalleDto(
            Id: caja.Id_Caja,
            CajaId: caja.Id_Caja,
            CierreId: caja.Id_Caja,
            FechaApertura: caja.Caj_FechaAperturaUtc,
            FechaAperturaLocal: fechaAperturaLocal,
            FechaCierre: caja.Caj_FechaCierreUtc,
            FechaCierreLocal: fechaCierreLocal,
            CajeroApertura: caja.Caj_Usuario?.Usu_Nombre ?? "Cajero",
            CajeroCierre: caja.Caj_UsuarioCierre?.Usu_Nombre,
            Estado: caja.Caj_Estado == EstadoCaja.Abierta ? "Abierta" : "Cerrada",
            MontoInicial: caja.Caj_MontoApertura,
            VentasEfectivo: caja.Caj_TotalVentasEfectivo ?? 0.00m,
            VentasYape: caja.Caj_TotalVentasYape ?? 0.00m,
            TotalVentas: caja.Caj_TotalVentas ?? 0.00m,
            EfectivoEsperado: caja.Caj_MontoEsperado ?? caja.Caj_MontoApertura,
            EfectivoContado: caja.Caj_MontoCierre,
            Diferencia: caja.Caj_Diferencia,
            EstadoCuadre: estadoCuadre,
            Resultado: resultado,
            Observacion: caja.Caj_Observacion,
            CantidadVentas: caja.Caj_CantidadVentas ?? 0,
            Platos: platosVendidos,
            PlatosVendidos: platosVendidos,
            AjustesPosteriores: ajustesPosteriores,
            MenusCompletos: menusCompletos,
            Componentes: componentes,
            ProductosCarta: productosCarta
        );
    }

    public Task<byte[]> GenerarPdfCierreAsync(Guid id, CancellationToken ct = default)
    {
        return _pdfCierreService.GenerarVoucherCierreAsync(id, ct);
    }

    // ==========================================
    // Métodos de compatibilidad retroactiva
    // ==========================================

    public async Task<CajaEstadoDto> ObtenerEstadoCajaAsync(CancellationToken ct = default)
    {
        var caja = await _cajaRepository.ObtenerCajaAbiertaActualAsync(ct);
        if (caja == null)
        {
            return new CajaEstadoDto(
                EstaAbierta: false,
                CajaId: null,
                MontoApertura: null,
                FechaAperturaUtc: null,
                FechaAperturaLocal: null,
                CajeroNombre: null
            );
        }

        var horaLocal = TimeZoneHelper.ToPeruTime(caja.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");

        return new CajaEstadoDto(
            EstaAbierta: true,
            CajaId: caja.Id_Caja,
            MontoApertura: caja.Caj_MontoApertura,
            FechaAperturaUtc: caja.Caj_FechaAperturaUtc,
            FechaAperturaLocal: horaLocal,
            CajeroNombre: caja.Caj_Usuario?.Usu_Nombre ?? "Cajero"
        );
    }

    public async Task<CajaEstadoDto> AbrirCajaAsync(AbrirCajaRequest request, Guid usuarioId, string nombreUsuario, CancellationToken ct = default)
    {
        var resp = await AbrirCajaAsync(new AbrirCajaRequestDto
        {
            MontoInicial = request.MontoApertura
        }, usuarioId, nombreUsuario, ct);

        return new CajaEstadoDto(
            EstaAbierta: true,
            CajaId: resp.CajaId,
            MontoApertura: resp.MontoInicial,
            FechaAperturaUtc: resp.FechaAperturaUtc,
            FechaAperturaLocal: resp.FechaAperturaLocal,
            CajeroNombre: nombreUsuario
        );
    }

    private static string ConstruirMensajeCuadre(decimal diferencia)
    {
        if (diferencia == 0.00m)
        {
            return string.Format(MensajesCatalogo.MSG_181, MensajesCatalogo.MSG_176);
        }

        if (diferencia > 0.00m)
        {
            return string.Format(MensajesCatalogo.MSG_181, string.Format(MensajesCatalogo.MSG_177, diferencia));
        }

        return string.Format(MensajesCatalogo.MSG_181, string.Format(MensajesCatalogo.MSG_178, Math.Abs(diferencia)));
    }

    private static bool IsUniqueIndexViolation(Exception ex)
    {
        var cur = ex;
        while (cur != null)
        {
            if (cur.Message.Contains("23505") || cur.Message.Contains("uq_cajas_solo_una_abierta"))
                return true;
            cur = cur.InnerException;
        }
        return false;
    }

    private static bool IsConcurrencyViolation(Exception ex)
    {
        var cur = ex;
        while (cur != null)
        {
            if (cur.GetType().Name.Contains("Concurrency") || cur.Message.Contains("concurrency"))
                return true;
            cur = cur.InnerException;
        }
        return false;
    }
}
