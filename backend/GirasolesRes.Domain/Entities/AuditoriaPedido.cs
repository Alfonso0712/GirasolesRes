namespace GirasolesRes.Domain.Entities;

public class AuditoriaPedido
{
    public Guid Id_Auditoria { get; private set; }
    public string Aud_Usuario { get; private set; } = string.Empty;
    public string Aud_Accion { get; private set; } = string.Empty;
    public string Aud_NumeroMesa { get; private set; } = string.Empty;
    public int Aud_NumeroPedido { get; private set; }
    public string? Aud_Detalle { get; private set; }
    public DateTime Aud_FechaRegistroUtc { get; private set; }
    public string? Aud_DireccionIp { get; private set; }

    // Constructor privado para EF Core
    private AuditoriaPedido() { }

    public AuditoriaPedido(
        string audUsuario,
        string audAccion,
        string audNumeroMesa,
        int audNumeroPedido,
        string? audDetalle = null,
        string? audDireccionIp = null)
    {
        Id_Auditoria = Guid.NewGuid();
        Aud_Usuario = audUsuario.Trim();
        Aud_Accion = audAccion.Trim();
        Aud_NumeroMesa = audNumeroMesa.Trim();
        Aud_NumeroPedido = audNumeroPedido;
        Aud_Detalle = audDetalle?.Trim();
        Aud_FechaRegistroUtc = DateTime.UtcNow;
        Aud_DireccionIp = audDireccionIp?.Trim();
    }
}
