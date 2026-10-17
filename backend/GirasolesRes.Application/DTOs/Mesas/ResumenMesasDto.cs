namespace GirasolesRes.Application.DTOs.Mesas;

public record ResumenMesasDto(
    int Total,
    int Libres,
    int Ocupadas,
    int Inactivas
);
