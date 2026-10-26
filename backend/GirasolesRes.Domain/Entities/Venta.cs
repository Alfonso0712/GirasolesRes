using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Venta
{
    public Guid Id_Venta { get; private set; }
    public Guid Id_Pedido { get; private set; }
    public Pedido? Ven_Pedido { get; private set; }

    public Guid Id_Usuario { get; private set; }
    public Usuario? Ven_Usuario { get; private set; }

    public Guid Id_Caja { get; private set; }
    public Caja? Ven_Caja { get; private set; }

    public decimal Ven_Total { get; private set; }
    public MetodoPago Ven_MetodoPago { get; private set; }
    public decimal? Ven_MontoRecibido { get; private set; }
    public decimal? Ven_Vuelto { get; private set; }
    public bool Ven_YapeConfirmado { get; private set; }
    public string? Ven_YapeReferencia { get; private set; }
    public string Ven_SolicitudId { get; private set; } = string.Empty;
    public EstadoVenta Ven_Estado { get; private set; } = EstadoVenta.Vigente;
    public DateTime Ven_FechaHoraUtc { get; private set; }
    public DateTime Ven_FechaCreacionUtc { get; private set; }

    public string? Ven_MotivoAnulacion { get; private set; }
    public string? Ven_UsuarioAnulacion { get; private set; }
    public DateTime? Ven_FechaHoraAnulacionUtc { get; private set; }
    public string? Ven_DestinoPedido { get; private set; }

    public Comprobante? Ven_Comprobante { get; private set; }

    // Constructor privado para EF Core
    private Venta() { }

    public Venta(
        Guid idPedido,
        Guid idUsuario,
        Guid idCaja,
        decimal venTotal,
        MetodoPago venMetodoPago,
        string venSolicitudId,
        decimal? venMontoRecibido = null,
        decimal? venVuelto = null,
        bool venYapeConfirmado = false,
        string? venYapeReferencia = null)
    {
        Id_Venta = Guid.NewGuid();
        Id_Pedido = idPedido;
        Id_Usuario = idUsuario;
        Id_Caja = idCaja;
        Ven_Total = decimal.Round(venTotal, 2);
        Ven_MetodoPago = venMetodoPago;
        Ven_SolicitudId = venSolicitudId.Trim();
        Ven_MontoRecibido = venMontoRecibido.HasValue ? decimal.Round(venMontoRecibido.Value, 2) : null;
        Ven_Vuelto = venVuelto.HasValue ? decimal.Round(venVuelto.Value, 2) : null;
        Ven_YapeConfirmado = venYapeConfirmado;
        Ven_YapeReferencia = string.IsNullOrWhiteSpace(venYapeReferencia) ? null : venYapeReferencia.Trim();
        Ven_Estado = EstadoVenta.Vigente;
        Ven_FechaHoraUtc = DateTime.UtcNow;
        Ven_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void Anular(string? motivo = null, string? usuario = null, string? destinoPedido = null)
    {
        Ven_Estado = EstadoVenta.Anulada;
        if (!string.IsNullOrWhiteSpace(motivo)) Ven_MotivoAnulacion = motivo.Trim();
        if (!string.IsNullOrWhiteSpace(usuario)) Ven_UsuarioAnulacion = usuario.Trim();
        Ven_FechaHoraAnulacionUtc = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(destinoPedido)) Ven_DestinoPedido = destinoPedido.Trim();
    }

    public void AsignarPedido(Pedido pedido)
    {
        Ven_Pedido = pedido;
    }
}
