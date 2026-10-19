using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Comprobante
{
    public Guid Id_Comprobante { get; private set; }
    public Guid Id_Venta { get; private set; }
    public Venta? Com_Venta { get; private set; }

    public string Com_Tipo { get; private set; } = "Ticket";
    public string Com_Serie { get; private set; } = "T001";
    public int Com_Numero { get; private set; }
    public decimal Com_Total { get; private set; }
    public MetodoPago Com_MetodoPago { get; private set; }
    public DateTime Com_FechaHoraUtc { get; private set; }
    public string Com_Leyenda { get; private set; } = "Documento sin validez tributaria";
    public EstadoComprobante Com_Estado { get; private set; } = EstadoComprobante.Emitido;
    public DateTime Com_FechaCreacionUtc { get; private set; }

    public string? Com_TipoDocReceptor { get; private set; }
    public string? Com_NumDocReceptor { get; private set; }
    public string? Com_RazonSocialReceptor { get; private set; }
    public string? Com_DireccionReceptor { get; private set; }
    public decimal Com_OpGravada { get; private set; }
    public decimal Com_Igv { get; private set; }

    // Constructor privado para EF Core
    private Comprobante() { }

    public Comprobante(
        Guid idVenta,
        int comNumero,
        decimal comTotal,
        MetodoPago comMetodoPago,
        string comSerie = "T001",
        string comTipo = "Ticket",
        string comLeyenda = "Documento sin validez tributaria",
        string? comTipoDocReceptor = null,
        string? comNumDocReceptor = null,
        string? comRazonSocialReceptor = null,
        string? comDireccionReceptor = null,
        decimal? comOpGravada = null,
        decimal? comIgv = null)
    {
        Id_Comprobante = Guid.NewGuid();
        Id_Venta = idVenta;
        Com_Numero = comNumero;
        Com_Serie = comSerie.Trim();
        Com_Tipo = comTipo.Trim();
        Com_Total = decimal.Round(comTotal, 2);
        Com_MetodoPago = comMetodoPago;
        Com_Leyenda = comLeyenda.Trim();
        Com_Estado = EstadoComprobante.Emitido;
        Com_FechaHoraUtc = DateTime.UtcNow;
        Com_FechaCreacionUtc = DateTime.UtcNow;

        Com_TipoDocReceptor = string.IsNullOrWhiteSpace(comTipoDocReceptor) ? null : comTipoDocReceptor.Trim();
        Com_NumDocReceptor = string.IsNullOrWhiteSpace(comNumDocReceptor) ? null : comNumDocReceptor.Trim();
        Com_RazonSocialReceptor = string.IsNullOrWhiteSpace(comRazonSocialReceptor) ? null : comRazonSocialReceptor.Trim();
        Com_DireccionReceptor = string.IsNullOrWhiteSpace(comDireccionReceptor) ? null : comDireccionReceptor.Trim();

        if (comOpGravada.HasValue && comIgv.HasValue)
        {
            Com_OpGravada = decimal.Round(comOpGravada.Value, 2);
            Com_Igv = decimal.Round(comIgv.Value, 2);
        }
        else
        {
            Com_OpGravada = decimal.Round(comTotal / 1.18m, 2);
            Com_Igv = Com_Total - Com_OpGravada;
        }
    }

    public void Anular()
    {
        Com_Estado = EstadoComprobante.Anulado;
    }

    public string ObtenerNumeroFormateado()
    {
        return $"{Com_Serie}-{Com_Numero:D6}";
    }
}
