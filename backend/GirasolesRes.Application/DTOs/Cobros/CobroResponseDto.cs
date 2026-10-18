namespace GirasolesRes.Application.DTOs.Cobros;

public record ComprobanteResumenDto(
    string Serie,
    int Numero,
    string NumeroFormateado,
    DateTime FechaHoraUtc,
    string FechaHoraLocal
);

public record CobroResponseDto(
    Guid VentaId,
    ComprobanteResumenDto Comprobante,
    decimal Vuelto,
    string Mensaje
);
