namespace GirasolesRes.Domain.Entities;

public class AuditoriaUsuario
{
    public Guid Id_Auditoria { get; private set; }
    public string Aud_NombreAdmin { get; private set; } = string.Empty;
    public string Aud_Accion { get; private set; } = string.Empty;
    public string Aud_NombreUsuarioAfectado { get; private set; } = string.Empty;
    public string? Aud_Detalle { get; private set; }
    public DateTime Aud_FechaRegistroUtc { get; private set; }
    public string? Aud_DireccionIp { get; private set; }

    // Constructor privado para EF Core
    private AuditoriaUsuario() { }

    public AuditoriaUsuario(
        string nombreAdmin,
        string accion,
        string nombreUsuarioAfectado,
        string? detalle = null,
        string? direccionIp = null)
    {
        Id_Auditoria = Guid.NewGuid();
        Aud_NombreAdmin = nombreAdmin.Trim();
        Aud_Accion = accion.Trim().ToUpperInvariant();
        Aud_NombreUsuarioAfectado = nombreUsuarioAfectado.Trim();
        Aud_Detalle = detalle?.Trim();
        Aud_FechaRegistroUtc = DateTime.UtcNow;
        Aud_DireccionIp = direccionIp?.Trim();
    }
}
