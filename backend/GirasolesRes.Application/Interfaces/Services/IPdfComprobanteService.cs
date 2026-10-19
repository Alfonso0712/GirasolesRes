using GirasolesRes.Application.DTOs.Cobros;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IPdfComprobanteService
{
    byte[] GenerarPdfComprobante(ComprobanteDetalleDto detalle);
}
