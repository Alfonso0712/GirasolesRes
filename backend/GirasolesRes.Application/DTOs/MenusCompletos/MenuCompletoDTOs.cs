using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GirasolesRes.Application.Common;

namespace GirasolesRes.Application.DTOs.MenusCompletos;

public class MenuCompletoParteResponseDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Orden { get; set; }
    public List<string> RolesPermitidos { get; set; } = new();
}

public class MenuCompletoResponseDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public bool Activo { get; set; }
    public string? Incluye { get; set; }
    public List<MenuCompletoParteResponseDto> Partes { get; set; } = new();
}

public class ActualizarPrecioMenuCompletoRequest : IValidatableObject
{
    [JsonPropertyName("precio")]
    [Range(0.01, 999.99, ErrorMessage = MensajesCatalogo.MSG_56)]
    public decimal Precio { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // RV-160: Precio mayor a cero y no superar S/ 999.99 con hasta dos decimales
        if (Precio <= 0)
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_55, new[] { nameof(Precio) });
        }
        else if (Precio > 999.99m || decimal.Round(Precio, 2) != Precio)
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_56, new[] { nameof(Precio) });
        }
    }
}

public class CambiarEstadoMenuCompletoRequest
{
    [JsonPropertyName("activo")]
    public bool Activo { get; set; }
}
