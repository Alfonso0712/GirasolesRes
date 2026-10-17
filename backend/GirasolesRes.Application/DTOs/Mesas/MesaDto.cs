namespace GirasolesRes.Application.DTOs.Mesas;

public record MesaDto(
    Guid Id,
    string Nombre,
    string Ocupacion,
    bool Activa
);
