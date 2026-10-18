using GirasolesRes.Application.DTOs.Caja;

namespace GirasolesRes.Application.Interfaces.Services;

/// <summary>
/// Servicio para la generación de comprobantes y actas de cierre de caja en PDF de 1 página (RNF-48, E-307).
/// </summary>
public interface IPdfCierreService
{
    /// <summary>
    /// Genera de forma asíncrona el comprobante PDF de 1 página para la caja cerrada especificada por su ID.
    /// </summary>
    Task<byte[]> GenerarVoucherCierreAsync(Guid cajaId, CancellationToken ct = default);

    /// <summary>
    /// Genera de forma síncrona el comprobante PDF de 1 página a partir de los datos consolidados en memoria.
    /// </summary>
    byte[] GenerarVoucherCierre(CierreVoucherDto datos);
}
