using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Mesa
{
    public Guid Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public string NombreNormalizado { get; private set; } = string.Empty;
    public EstadoOcupacionMesa Ocupacion { get; private set; } = EstadoOcupacionMesa.Libre;
    public bool Activa { get; private set; } = true;
    public DateTime FechaCreacionUtc { get; private set; }
    public DateTime? FechaActualizacionUtc { get; private set; }

    // Constructor privado para EF Core
    private Mesa() { }

    public Mesa(string nombre)
    {
        Id = Guid.NewGuid();
        Nombre = LimpiarEspacios(nombre);
        NombreNormalizado = NormalizarNombre(Nombre);
        Ocupacion = EstadoOcupacionMesa.Libre;
        Activa = true;
        FechaCreacionUtc = DateTime.UtcNow;
    }

    public void ActualizarNombre(string nuevoNombre)
    {
        Nombre = LimpiarEspacios(nuevoNombre);
        NombreNormalizado = NormalizarNombre(Nombre);
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarActiva(bool activa)
    {
        if (!activa && Ocupacion == EstadoOcupacionMesa.Ocupada)
        {
            throw new InvalidOperationException("No se puede desactivar una mesa ocupada.");
        }

        Activa = activa;
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarOcupacion(EstadoOcupacionMesa nuevaOcupacion)
    {
        Ocupacion = nuevaOcupacion;
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public static string LimpiarEspacios(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            return string.Empty;

        return Regex.Replace(texto.Trim(), @"\s+", " ");
    }

    public static string NormalizarNombre(string texto)
    {
        var limpio = LimpiarEspacios(texto);
        if (string.IsNullOrEmpty(limpio))
            return string.Empty;

        var normalizedString = limpio.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToUpperInvariant();
    }
}
