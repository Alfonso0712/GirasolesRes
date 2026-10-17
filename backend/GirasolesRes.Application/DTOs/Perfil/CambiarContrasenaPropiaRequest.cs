using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GirasolesRes.Application.Common;

namespace GirasolesRes.Application.DTOs.Perfil;

public class CambiarContrasenaPropiaRequest : IValidatableObject
{
    [JsonPropertyName("contrasenaActual")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_44)]
    public string ContrasenaActual { get; set; } = string.Empty;

    [JsonPropertyName("nuevaContrasena")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_14)]
    [StringLength(64, MinimumLength = 8, ErrorMessage = MensajesCatalogo.MSG_14)]
    public string NuevaContrasena { get; set; } = string.Empty;

    [JsonPropertyName("confirmarContrasena")]
    public string? ConfirmarContrasena { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // RV-23: Contraseña actual obligatoria
        if (string.IsNullOrWhiteSpace(ContrasenaActual))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_44, new[] { nameof(ContrasenaActual) });
        }

        // RV-24: Nueva contraseña entre 8 y 64 caracteres
        if (string.IsNullOrWhiteSpace(NuevaContrasena) || NuevaContrasena.Length < 8 || NuevaContrasena.Length > 64)
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_14, new[] { nameof(NuevaContrasena) });
        }

        // RV-26 / RN-18: La nueva contraseña debe ser distinta de la actual
        if (!string.IsNullOrEmpty(ContrasenaActual) && !string.IsNullOrEmpty(NuevaContrasena))
        {
            if (ContrasenaActual.Trim() == NuevaContrasena.Trim())
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_46, new[] { nameof(NuevaContrasena) });
            }
        }

        // RV-25: Si se envió confirmación, debe coincidir
        if (!string.IsNullOrEmpty(ConfirmarContrasena) && ConfirmarContrasena != NuevaContrasena)
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_15, new[] { nameof(ConfirmarContrasena) });
        }
    }
}
