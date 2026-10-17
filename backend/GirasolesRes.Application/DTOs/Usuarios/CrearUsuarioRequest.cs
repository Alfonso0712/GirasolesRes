using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using GirasolesRes.Application.Common;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.DTOs.Usuarios;

public class CrearUsuarioRequest : IValidatableObject
{
    [JsonPropertyName("nombre")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_19)]
    [StringLength(60, MinimumLength = 3, ErrorMessage = MensajesCatalogo.MSG_20)]
    [RegularExpression(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$", ErrorMessage = MensajesCatalogo.MSG_20)]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("usuario")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_01)]
    [StringLength(30, MinimumLength = 3, ErrorMessage = MensajesCatalogo.MSG_03)]
    [RegularExpression(@"^[a-zA-Z0-9._-]+$", ErrorMessage = MensajesCatalogo.MSG_03)]
    public string Usuario { get; set; } = string.Empty;

    [JsonPropertyName("correo")]
    [MaxLength(100, ErrorMessage = MensajesCatalogo.MSG_12)]
    public string? Correo { get; set; }

    [JsonPropertyName("contrasena")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_14)]
    [StringLength(64, MinimumLength = 8, ErrorMessage = MensajesCatalogo.MSG_14)]
    public string Contrasena { get; set; } = string.Empty;

    [JsonPropertyName("rol")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_22)]
    public string Rol { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // RV-15: Validar que el rol exista en la lista cerrada
        if (!Enum.TryParse<RolUsuario>(Rol, true, out var rolEnum) || !Enum.IsDefined(typeof(RolUsuario), rolEnum))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_22, new[] { nameof(Rol) });
        }

        // RV-16: El correo es obligatorio si el rol es Administrador
        if (rolEnum == RolUsuario.Administrador)
        {
            if (string.IsNullOrWhiteSpace(Correo))
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_23, new[] { nameof(Correo) });
            }
        }

        // RV-16: Formato válido de correo si se proporciona
        if (!string.IsNullOrWhiteSpace(Correo))
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
            if (!emailRegex.IsMatch(Correo.Trim()))
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_12, new[] { nameof(Correo) });
            }
        }
    }
}
