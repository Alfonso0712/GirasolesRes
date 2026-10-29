namespace GirasolesRes.Domain.Entities;

public static class OrientacionUsuario
{
    public const string Diestro = "right";
    public const string Zurdo = "left";

    public static bool EsValido(string? orientacion)
    {
        return orientacion is Diestro or Zurdo;
    }
}
