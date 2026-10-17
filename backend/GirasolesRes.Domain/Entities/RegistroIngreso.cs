namespace GirasolesRes.Domain.Entities;

public class RegistroIngreso
{
    public Guid Id_Registro { get; private set; }
    public string Reg_NombreUsuario { get; private set; } = string.Empty;
    public DateTime Reg_FechaHoraUtc { get; private set; }
    public bool Reg_Exitoso { get; private set; }
    public string? Reg_DetalleResultado { get; private set; }
    public string? Reg_DireccionIp { get; private set; }

    private RegistroIngreso() { }

    public RegistroIngreso(string regNombreUsuario, bool regExitoso, string? regDetalleResultado = null, string? regDireccionIp = null)
    {
        Id_Registro = Guid.NewGuid();
        Reg_NombreUsuario = regNombreUsuario.Trim().ToLowerInvariant();
        Reg_FechaHoraUtc = DateTime.UtcNow;
        Reg_Exitoso = regExitoso;
        Reg_DetalleResultado = regDetalleResultado;
        Reg_DireccionIp = regDireccionIp;
    }
}
