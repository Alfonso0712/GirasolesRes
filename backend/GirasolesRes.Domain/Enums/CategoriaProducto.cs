namespace GirasolesRes.Domain.Enums;

public enum CategoriaProducto
{
    Desayuno = 1,
    Almuerzo = 2,
    PlatosExtras = 3,
    Combinados = 4,
    Bebidas = 5,
    Otro = 6
}

public static class CategoriaProductoExtensions
{
    public static string ObtenerTextoLegible(this CategoriaProducto categoria) => categoria switch
    {
        CategoriaProducto.Desayuno => "Desayuno",
        CategoriaProducto.Almuerzo => "Almuerzo",
        CategoriaProducto.PlatosExtras => "Platos Extras / A la Carta",
        CategoriaProducto.Combinados => "Combinados",
        CategoriaProducto.Bebidas => "Bebidas y Refrescos",
        CategoriaProducto.Otro => "Otro",
        _ => categoria.ToString()
    };

    public static bool TryParseFlexible(string? input, out CategoriaProducto categoria)
    {
        categoria = CategoriaProducto.Otro;
        if (string.IsNullOrWhiteSpace(input)) return false;

        var clean = input.Trim();
        if (Enum.TryParse<CategoriaProducto>(clean, true, out categoria) && Enum.IsDefined(typeof(CategoriaProducto), categoria))
        {
            return true;
        }

        var norm = clean.ToLowerInvariant()
            .Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u")
            .Replace("-", "").Replace("_", "").Replace(" ", "").Replace("/", "");

        if (norm.Contains("desayuno"))
        {
            categoria = CategoriaProducto.Desayuno;
            return true;
        }

        if (norm.Contains("almuerzo"))
        {
            categoria = CategoriaProducto.Almuerzo;
            return true;
        }

        if (norm.Contains("extra") || norm.Contains("carta"))
        {
            categoria = CategoriaProducto.PlatosExtras;
            return true;
        }

        if (norm.Contains("combina"))
        {
            categoria = CategoriaProducto.Combinados;
            return true;
        }

        if (norm.Contains("bebida") || norm.Contains("refresco") || norm.Contains("gaseosa") || norm.Contains("agua") || norm.Contains("jarra"))
        {
            categoria = CategoriaProducto.Bebidas;
            return true;
        }

        if (norm.Contains("otro"))
        {
            categoria = CategoriaProducto.Otro;
            return true;
        }

        return false;
    }
}
