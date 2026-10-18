namespace GirasolesRes.Application.DTOs.Cobros;

public record PedidoPendienteCobroDto(
    Guid PedidoId,
    int Numero,
    string Tipo,
    string? Mesa,
    string? Referencia,
    string Hora,
    string Estado,
    decimal Total,
    bool EstaListo,
    Guid? MesaId = null
);
