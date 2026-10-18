namespace GirasolesRes.Domain.Entities;

public class DetalleComanda
{
    public Guid Id_DetalleComanda { get; private set; }
    public Guid Id_Comanda { get; private set; }
    public Comanda? Dtc_Comanda { get; private set; }

    public Guid Id_Producto { get; private set; }
    public Producto? Dtc_Producto { get; private set; }

    public string Dtc_NombreProducto { get; private set; } = string.Empty;
    public int Dtc_Cantidad { get; private set; }
    public string? Dtc_Observacion { get; private set; }
    public DateTime Dtc_FechaCreacionUtc { get; private set; }

    // Constructor privado para EF Core
    private DetalleComanda() { }

    public DetalleComanda(
        Guid idComanda,
        Guid idProducto,
        string dtcNombreProducto,
        int dtcCantidad,
        string? dtcObservacion = null)
    {
        Id_DetalleComanda = Guid.NewGuid();
        Id_Comanda = idComanda;
        Id_Producto = idProducto;
        Dtc_NombreProducto = dtcNombreProducto.Trim();
        Dtc_Cantidad = dtcCantidad;
        Dtc_Observacion = string.IsNullOrWhiteSpace(dtcObservacion) ? null : dtcObservacion.Trim();
        Dtc_FechaCreacionUtc = DateTime.UtcNow;
    }
}
