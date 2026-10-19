namespace GirasolesRes.Domain.Enums;

public enum RolComponente
{
    BebidaDesayuno = 1,
    PlatoDesayuno = 2,
    Sopa = 3,
    Entrada = 4,
    Segundo = 5
}

public static class RolComponenteExtensions
{
    public static string ObtenerTextoLegible(this RolComponente rol) => rol switch
    {
        RolComponente.BebidaDesayuno => "Bebida de desayuno",
        RolComponente.PlatoDesayuno => "Plato de desayuno",
        RolComponente.Sopa => "Sopa",
        RolComponente.Entrada => "Entrada",
        RolComponente.Segundo => "Segundo",
        _ => rol.ToString()
    };

    public static bool TryParseFlexible(string? input, out RolComponente rol)
    {
        rol = RolComponente.Segundo;
        if (string.IsNullOrWhiteSpace(input)) return false;

        var clean = input.Trim();
        if (Enum.TryParse<RolComponente>(clean, true, out rol) && Enum.IsDefined(typeof(RolComponente), rol))
        {
            return true;
        }

        var norm = clean.ToLowerInvariant()
            .Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u")
            .Replace("-", "").Replace("_", "").Replace(" ", "");

        if (norm.Contains("bebid") && norm.Contains("desayuno"))
        {
            rol = RolComponente.BebidaDesayuno;
            return true;
        }

        if (norm.Contains("plat") && norm.Contains("desayuno"))
        {
            rol = RolComponente.PlatoDesayuno;
            return true;
        }

        if (norm.Contains("sopa"))
        {
            rol = RolComponente.Sopa;
            return true;
        }

        if (norm.Contains("entrada"))
        {
            rol = RolComponente.Entrada;
            return true;
        }

        if (norm.Contains("segundo"))
        {
            rol = RolComponente.Segundo;
            return true;
        }

        return false;
    }
}
