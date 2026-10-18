namespace GirasolesRes.Domain.Entities;

public class AuditoriaReporte
{
    public Guid Id_Auditoria { get; private set; }
    public string Aud_Usuario { get; private set; } = string.Empty;
    public string Aud_TipoReporte { get; private set; } = string.Empty;
    public string Aud_Rango { get; private set; } = string.Empty;
    public string Aud_Formato { get; private set; } = string.Empty;
    public DateTime Aud_FechaRegistroUtc { get; private set; }
    public string? Aud_DireccionIp { get; private set; }

    // Constructor privado para EF Core
    private AuditoriaReporte() { }

    public AuditoriaReporte(
        string audUsuario,
        string audTipoReporte,
        string audRango,
        string audFormato,
        string? audDireccionIp = null)
    {
        Id_Auditoria = Guid.NewGuid();
        Aud_Usuario = audUsuario.Trim();
        Aud_TipoReporte = audTipoReporte.Trim();
        Aud_Rango = audRango.Trim();
        Aud_Formato = audFormato.Trim().ToUpperInvariant();
        Aud_FechaRegistroUtc = DateTime.UtcNow;
        Aud_DireccionIp = audDireccionIp?.Trim();
    }
}
