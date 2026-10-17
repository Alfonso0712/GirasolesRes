namespace GirasolesRes.Domain.Entities;

public class AuditoriaMesa
{
    public Guid Id { get; private set; }
    public string NombreAdmin { get; private set; } = string.Empty;
    public string Accion { get; private set; } = string.Empty;
    public string NombreMesa { get; private set; } = string.Empty;
    public string? Detalle { get; private set; }
    public DateTime FechaRegistroUtc { get; private set; }
    public string? DireccionIp { get; private set; }

    // Constructor privado para EF Core
    private AuditoriaMesa() { }

    public AuditoriaMesa(
        string nombreAdmin,
        string accion,
        string nombreMesa,
        string? detalle = null,
        string? direccionIp = null)
    {
        Id = Guid.NewGuid();
        NombreAdmin = nombreAdmin.Trim();
        Accion = accion.Trim().ToUpperInvariant();
        NombreMesa = nombreMesa.Trim();
        Detalle = detalle?.Trim();
        FechaRegistroUtc = DateTime.UtcNow;
        DireccionIp = direccionIp?.Trim();
    }
}
