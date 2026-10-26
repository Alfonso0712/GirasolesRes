using GirasolesRes.Application.Common;
using GirasolesRes.Application.Common.Exceptions;
using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Domain.Exceptions;

namespace GirasolesRes.Application.Services;

public class CajaOperacionService : ICajaOperacionService
{
    private readonly ICajaRepository _cajaRepository;
    private readonly IPedidoRepository _pedidoRepository;

    public CajaOperacionService(
        ICajaRepository cajaRepository,
        IPedidoRepository pedidoRepository)
    {
        _cajaRepository = cajaRepository;
        _pedidoRepository = pedidoRepository;
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
