namespace GirasolesRes.Domain.Enums;

public enum TipoProducto
{
    Carta = 1,
    Componente = 2
}

public static class TipoProductoExtensions
{
    public static string ObtenerTextoLegible(this TipoProducto tipo) => tipo switch
    {
        TipoProducto.Carta => "Producto de carta",
        TipoProducto.Componente => "Componente de menú",
        _ => tipo.ToString()
    };

    public static bool TryParseFlexible(string? input, out TipoProducto tipo)
    {
        tipo = TipoProducto.Carta;
        if (string.IsNullOrWhiteSpace(input)) return false;

        var clean = input.Trim();
        if (Enum.TryParse<TipoProducto>(clean, true, out tipo) && Enum.IsDefined(typeof(TipoProducto), tipo))
        {
            return true;
        }

        var norm = clean.ToLowerInvariant()
            .Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u")
            .Replace("-", "").Replace("_", "").Replace(" ", "");

        if (norm.Contains("carta"))
        {
            tipo = TipoProducto.Carta;
            return true;
        }

        if (norm.Contains("componente"))
        {
            tipo = TipoProducto.Componente;
            return true;
        }

        return false;
    }
}
