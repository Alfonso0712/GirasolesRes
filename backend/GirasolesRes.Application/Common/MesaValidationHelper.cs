using GirasolesRes.Domain.Common;

namespace GirasolesRes.Application.Common;

public static class MesaValidationHelper
{
    public static string LimpiarEspacios(string? texto) => StringNormalizer.LimpiarEspacios(texto);

    public static string NormalizarNombre(string? texto) => StringNormalizer.NormalizarMayusculas(texto);
}
