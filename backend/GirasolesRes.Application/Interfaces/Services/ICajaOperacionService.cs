using GirasolesRes.Application.DTOs.Caja;

namespace GirasolesRes.Application.Interfaces.Services;

/// <summary>
/// Contrato de servicio para operaciones transaccionales de caja (apertura, cierre y cuadre).
/// </summary>
public interface ICajaOperacionService
{
    Task<CajaResponseDto> AbrirCajaAsync(AbrirCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default);
    Task<CierreResponseDto> CerrarCajaAsync(CerrarCajaRequestDto dto, Guid usuarioId, string? nombreUsuario = null, CancellationToken ct = default);

    // Métodos heredados para retrocompatibilidad
    Task<CajaEstadoDto> AbrirCajaAsync(AbrirCajaRequest request, Guid usuarioId, string nombreUsuario, CancellationToken ct = default);
}
