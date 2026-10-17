namespace GirasolesRes.Domain.Entities;

public class CodigoRecuperacion
{
    public Guid Id_Codigo { get; private set; }
    public string Cod_Correo { get; private set; } = string.Empty;
    public string Cod_Codigo { get; private set; } = string.Empty;
    public DateTime Cod_FechaExpiracionUtc { get; private set; }
    public bool Cod_Usado { get; private set; }
    public DateTime Cod_FechaCreacionUtc { get; private set; }

    private CodigoRecuperacion() { }

    public CodigoRecuperacion(string codCorreo, string codCodigo, int minutosValidez = 15)
    {
        Id_Codigo = Guid.NewGuid();
        Cod_Correo = codCorreo.Trim().ToLowerInvariant();
        Cod_Codigo = codCodigo.Trim();
        Cod_FechaCreacionUtc = DateTime.UtcNow;
        Cod_FechaExpiracionUtc = DateTime.UtcNow.AddMinutes(minutosValidez);
        Cod_Usado = false;
    }

    public bool EsValido(string codigoComparar)
    {
        return !Cod_Usado &&
               Cod_Codigo == codigoComparar.Trim() &&
               DateTime.UtcNow <= Cod_FechaExpiracionUtc;
    }

    public void MarcarComoUsado()
    {
        Cod_Usado = true;
    }

    public void Invalidar()
    {
        Cod_Usado = true;
    }
}
