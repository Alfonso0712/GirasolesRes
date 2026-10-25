using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.DTOs.Perfil;

public class ActualizarTemaRequest : IValidatableObject
{
    [JsonPropertyName("tema")]
    [Required(ErrorMessage = "El tema es obligatorio.")]
    [RegularExpression(@"^(?i)(light|dark)$", ErrorMessage = "El tema debe ser 'light' o 'dark'.")]
    public string Tema { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var normalizado = (Tema ?? string.Empty).Trim().ToLowerInvariant();
        if (!TemaUsuario.EsValido(normalizado))
        {
            yield return new ValidationResult("El tema debe ser 'light' o 'dark'.", new[] { nameof(Tema) });
        }
    }
}
