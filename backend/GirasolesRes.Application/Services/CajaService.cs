using GirasolesRes.Application.Common;
using GirasolesRes.Application.DTOs.Caja;
using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Application.Interfaces.Services;
using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Services;

public class CajaService : ICajaService
{
    private readonly ICajaRepository _cajaRepository;

    public CajaService(ICajaRepository cajaRepository)
    {
        _cajaRepository = cajaRepository;
    }

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
        var cajaExistente = await _cajaRepository.ObtenerCajaAbiertaActualAsync(ct);
        if (cajaExistente != null)
        {
            throw new InvalidOperationException("Ya existe una caja abierta en el sistema.");
        }

        if (request.MontoApertura < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(request.MontoApertura), "El monto inicial en efectivo no puede ser negativo.");
        }

        var nuevaCaja = new Caja(usuarioId, request.MontoApertura);
        await _cajaRepository.AgregarAsync(nuevaCaja, ct);

        var horaLocal = TimeZoneHelper.ToPeruTime(nuevaCaja.Caj_FechaAperturaUtc).ToString("dd/MM/yyyy HH:mm");

        return new CajaEstadoDto(
            EstaAbierta: true,
            CajaId: nuevaCaja.Id_Caja,
            MontoApertura: nuevaCaja.Caj_MontoApertura,
            FechaAperturaUtc: nuevaCaja.Caj_FechaAperturaUtc,
            FechaAperturaLocal: horaLocal,
            CajeroNombre: nombreUsuario
        );
    }
}
