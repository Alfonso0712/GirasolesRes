namespace GirasolesRes.Domain.Entities;

public class TokenRevocado
{
    public Guid Id_TokenRevocado { get; private set; }
    public string Tok_Jti { get; private set; } = string.Empty;
    public string Tok_NombreUsuario { get; private set; } = string.Empty;
    public DateTime Tok_FechaExpiracionUtc { get; private set; }
    public DateTime Tok_FechaRevocacionUtc { get; private set; }
    public string Tok_Motivo { get; private set; } = string.Empty;

    // Constructor privado para EF Core
    private TokenRevocado() { }

    public TokenRevocado(
        string tokJti,
        string tokNombreUsuario,
        DateTime tokFechaExpiracionUtc,
        string tokMotivo)
    {
        Id_TokenRevocado = Guid.NewGuid();
        Tok_Jti = tokJti.Trim();
        Tok_NombreUsuario = tokNombreUsuario.Trim().ToLowerInvariant();
        Tok_FechaExpiracionUtc = tokFechaExpiracionUtc;
        Tok_FechaRevocacionUtc = DateTime.UtcNow;
        Tok_Motivo = tokMotivo.Trim().ToUpperInvariant();
    }
}
