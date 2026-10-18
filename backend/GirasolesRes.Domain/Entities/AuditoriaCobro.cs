namespace GirasolesRes.Domain.Entities;

public class AuditoriaCobro
{
    public Guid Id_Auditoria { get; private set; }
    public string Aud_Usuario { get; private set; } = string.Empty;
    public string Aud_Accion { get; private set; } = string.Empty;
    public int Aud_NumeroPedido { get; private set; }
    public string Aud_Comprobante { get; private set; } = string.Empty;
    public string Aud_MedioPago { get; private set; } = string.Empty;
    public decimal Aud_Total { get; private set; }
    public decimal? Aud_MontoRecibido { get; private set; }
    public decimal? Aud_Vuelto { get; private set; }
    public string? Aud_Detalle { get; private set; }
    public DateTime Aud_FechaRegistroUtc { get; private set; }
    public string? Aud_DireccionIp { get; private set; }

    // Constructor privado para EF Core
    private AuditoriaCobro() { }

    public AuditoriaCobro(
        string audUsuario,
        string audAccion,
        int audNumeroPedido,
        string audComprobante,
        string audMedioPago,
        decimal audTotal,
        decimal? audMontoRecibido,
        decimal? audVuelto,
        string? audDetalle = null,
        string? audDireccionIp = null)
    {
        Id_Auditoria = Guid.NewGuid();
        Aud_Usuario = audUsuario.Trim();
        Aud_Accion = audAccion.Trim();
        Aud_NumeroPedido = audNumeroPedido;
        Aud_Comprobante = audComprobante.Trim();
        Aud_MedioPago = audMedioPago.Trim();
        Aud_Total = decimal.Round(audTotal, 2);
        Aud_MontoRecibido = audMontoRecibido.HasValue ? decimal.Round(audMontoRecibido.Value, 2) : null;
        Aud_Vuelto = audVuelto.HasValue ? decimal.Round(audVuelto.Value, 2) : null;
        Aud_Detalle = audDetalle?.Trim();
        Aud_DireccionIp = audDireccionIp?.Trim();
        Aud_FechaRegistroUtc = DateTime.UtcNow;
    }
}
