using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.DTOs.Perfil;

public class ActualizarOrientacionRequest : IValidatableObject
{
    [JsonPropertyName("orientacion")]
    [Required(ErrorMessage = "La orientación es obligatoria.")]
    [RegularExpression(@"^(?i)(right|left)$", ErrorMessage = "La orientación debe ser 'right' o 'left'.")]
    public string Orientacion { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var normalizado = (Orientacion ?? string.Empty).Trim().ToLowerInvariant();
        if (!OrientacionUsuario.EsValido(normalizado))
        {
            yield return new ValidationResult("La orientación debe ser 'right' o 'left'.", new[] { nameof(Orientacion) });
        }
    }
}
