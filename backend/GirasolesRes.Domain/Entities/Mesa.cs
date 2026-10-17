using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Mesa
{
    public Guid Id_Mesa { get; private set; }
    public string Mes_Nombre { get; private set; } = string.Empty;
    public string Mes_NombreNormalizado { get; private set; } = string.Empty;
    public EstadoOcupacionMesa Mes_Ocupacion { get; private set; } = EstadoOcupacionMesa.Libre;
    public bool Mes_Activa { get; private set; } = true;
    public DateTime Mes_FechaCreacionUtc { get; private set; }
    public DateTime? Mes_FechaActualizacionUtc { get; private set; }

    // Constructor privado para EF Core
    private Mesa() { }

    public Mesa(string mesNombre)
    {
        Id_Mesa = Guid.NewGuid();
        Mes_Nombre = LimpiarEspacios(mesNombre);
        Mes_NombreNormalizado = NormalizarNombre(Mes_Nombre);
        Mes_Ocupacion = EstadoOcupacionMesa.Libre;
        Mes_Activa = true;
        Mes_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void ActualizarNombre(string nuevoNombre)
    {
        Mes_Nombre = LimpiarEspacios(nuevoNombre);
        Mes_NombreNormalizado = NormalizarNombre(Mes_Nombre);
        Mes_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarActiva(bool activa)
    {
        if (!activa && Mes_Ocupacion == EstadoOcupacionMesa.Ocupada)
        {
            throw new InvalidOperationException("No se puede desactivar una mesa ocupada.");
        }

        Mes_Activa = activa;
        Mes_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarOcupacion(EstadoOcupacionMesa nuevaOcupacion)
    {
        Mes_Ocupacion = nuevaOcupacion;
        Mes_FechaActualizacionUtc = DateTime.UtcNow;
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
