using System.ComponentModel.DataAnnotations;

namespace GirasolesRes.Application.DTOs.Caja;

public class AbrirCajaRequest
{
    [Required(ErrorMessage = "El monto inicial en efectivo es obligatorio.")]
    [Range(0.0, 9999.99, ErrorMessage = "El monto inicial debe ser mayor o igual a cero y hasta 9,999.99.")]
    public decimal MontoApertura { get; set; }
}

public record CajaEstadoDto(
    bool EstaAbierta,
    Guid? CajaId,
    decimal? MontoApertura,
    DateTime? FechaAperturaUtc,
    string? FechaAperturaLocal,
    string? CajeroNombre
);
