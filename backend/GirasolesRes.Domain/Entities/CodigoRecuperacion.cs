namespace GirasolesRes.Domain.Entities;

public class CodigoRecuperacion
{
    public Guid Id { get; private set; }
    public string Correo { get; private set; } = string.Empty;
    public string Codigo { get; private set; } = string.Empty;
    public DateTime FechaExpiracionUtc { get; private set; }
    public bool Usado { get; private set; }
    public DateTime FechaCreacionUtc { get; private set; }

    private CodigoRecuperacion() { }

    public CodigoRecuperacion(string correo, string codigo, int minutosValidez = 15)
    {
        Id = Guid.NewGuid();
        Correo = correo.Trim().ToLowerInvariant();
        Codigo = codigo.Trim();
        FechaCreacionUtc = DateTime.UtcNow;
        FechaExpiracionUtc = DateTime.UtcNow.AddMinutes(minutosValidez);
        Usado = false;
    }

    public bool EsValido(string codigoComparar)
    {
        return !Usado &&
               Codigo == codigoComparar.Trim() &&
               DateTime.UtcNow <= FechaExpiracionUtc;
    }

    public void MarcarComoUsado()
    {
        Usado = true;
    }

    public void Invalidar()
    {
        Usado = true;
    }
}
