namespace GirasolesRes.Domain.Entities;

public static class TemaUsuario
{
    public const string Claro = "light";
    public const string Oscuro = "dark";

    public static bool EsValido(string? tema)
    {
        return tema is Claro or Oscuro;
    }
}
