namespace GirasolesRes.Domain.Entities;

public class TokenRevocado
{
    public Guid Id { get; private set; }
    public string Jti { get; private set; } = string.Empty;
    public string NombreUsuario { get; private set; } = string.Empty;
    public DateTime FechaExpiracionUtc { get; private set; }
    public DateTime FechaRevocacionUtc { get; private set; }
    public string Motivo { get; private set; } = string.Empty;

    // Constructor privado para EF Core
    private TokenRevocado() { }

    public TokenRevocado(
        string jti,
        string nombreUsuario,
        DateTime fechaExpiracionUtc,
        string motivo)
    {
        Id = Guid.NewGuid();
        Jti = jti.Trim();
        NombreUsuario = nombreUsuario.Trim().ToLowerInvariant();
        FechaExpiracionUtc = fechaExpiracionUtc;
        FechaRevocacionUtc = DateTime.UtcNow;
        Motivo = motivo.Trim().ToUpperInvariant();
    }
}
