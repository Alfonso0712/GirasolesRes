namespace GirasolesRes.Domain.Entities;

public class RegistroIngreso
{
    public Guid Id { get; private set; }
    public string NombreUsuario { get; private set; } = string.Empty;
    public DateTime FechaHoraUtc { get; private set; }
    public bool Exitoso { get; private set; }
    public string? DetalleResultado { get; private set; }
    public string? DireccionIp { get; private set; }

    private RegistroIngreso() { }

    public RegistroIngreso(string nombreUsuario, bool exitoso, string? detalleResultado = null, string? direccionIp = null)
    {
        Id = Guid.NewGuid();
        NombreUsuario = nombreUsuario.Trim().ToLowerInvariant();
        FechaHoraUtc = DateTime.UtcNow;
        Exitoso = exitoso;
        DetalleResultado = detalleResultado;
        DireccionIp = direccionIp;
    }
}
