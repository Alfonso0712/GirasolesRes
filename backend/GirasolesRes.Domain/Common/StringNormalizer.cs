using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace GirasolesRes.Domain.Common;

/// <summary>
/// Utilidad transversal de normalización de cadenas y remoción de diacríticos para búsquedas y unicidad (DRY).
/// </summary>
public static class StringNormalizer
{
    private static readonly Regex EspaciosMultiplesRegex = new(@"\s+", RegexOptions.Compiled);

    /// <summary>
    /// Remueve espacios redundantes al inicio, final y entre palabras.
    /// </summary>
    public static string LimpiarEspacios(string? texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            return string.Empty;

        return EspaciosMultiplesRegex.Replace(texto.Trim(), " ");
    }

    /// <summary>
    /// Remueve tildes, signos diacríticos y diéresis de un texto.
    /// </summary>
    public static string RemoverDiacriticos(string? texto)
    {
        var limpio = LimpiarEspacios(texto);
        if (string.IsNullOrEmpty(limpio))
            return string.Empty;

        var normalizedString = limpio.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    /// <summary>
    /// Normaliza a minúsculas sin tildes ni espacios superfluos (RV-34 / RV-37).
    /// </summary>
    public static string NormalizarParaBusqueda(string? texto)
    {
        return RemoverDiacriticos(texto).ToLowerInvariant();
    }

    /// <summary>
    /// Normaliza a mayúsculas sin tildes ni espacios superfluos (RV-52 / RN-41).
    /// </summary>
    public static string NormalizarMayusculas(string? texto)
    {
        return RemoverDiacriticos(texto).ToUpperInvariant();
    }
}
