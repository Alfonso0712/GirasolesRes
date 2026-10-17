using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using GirasolesRes.Application.Common;

namespace GirasolesRes.Application.DTOs.Mesas;

public class ActualizarMesaRequest : IValidatableObject
{
    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    // Propiedad puente de compatibilidad con prefijos de cátedra
    [JsonPropertyName("nom_mesa")]
    public string Nom_Mesa { get => Nombre; set => Nombre = value; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var nombreLimpio = MesaValidationHelper.LimpiarEspacios(Nombre);

        if (string.IsNullOrWhiteSpace(nombreLimpio))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_81, new[] { nameof(Nombre) });
            yield break;
        }

        if (nombreLimpio.Length < 1 || nombreLimpio.Length > 20)
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_82, new[] { nameof(Nombre) });
            yield break;
        }

        if (!Regex.IsMatch(nombreLimpio, @"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-.]+$"))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_82, new[] { nameof(Nombre) });
        }
    }
}
