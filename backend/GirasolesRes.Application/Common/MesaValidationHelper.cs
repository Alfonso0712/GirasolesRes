using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace GirasolesRes.Application.Common;

public static class MesaValidationHelper
{
    public static string LimpiarEspacios(string? texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            return string.Empty;

        return Regex.Replace(texto.Trim(), @"\s+", " ");
    }

    public static string NormalizarNombre(string? texto)
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
