namespace GirasolesRes.Domain.Entities;

public class DetalleComanda
{
    public Guid Id_DetalleComanda { get; private set; }
    public Guid Id_Comanda { get; private set; }
    public Comanda? Dtc_Comanda { get; private set; }

    public Guid? Id_Producto { get; private set; }
    public Producto? Dtc_Producto { get; private set; }

    public int? Id_MenuCompleto { get; private set; }
    public MenuCompleto? Dtc_MenuCompleto { get; private set; }

    public string Dtc_NombreProducto { get; private set; } = string.Empty;
    public string? Dtc_Elecciones { get; private set; }
    public string? Dtc_Incluye { get; private set; }
    public int Dtc_Cantidad { get; private set; }
    public string? Dtc_Observacion { get; private set; }
    public DateTime Dtc_FechaCreacionUtc { get; private set; }

    // Constructor privado para EF Core
    private DetalleComanda() { }

    /// <summary>
    /// Constructor para producto de carta tradicional.
    /// </summary>
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
        Id_MenuCompleto = null;
        Dtc_NombreProducto = dtcNombreProducto.Trim();
        Dtc_Elecciones = null;
        Dtc_Incluye = null;
        Dtc_Cantidad = dtcCantidad;
        Dtc_Observacion = string.IsNullOrWhiteSpace(dtcObservacion) ? null : dtcObservacion.Trim();
        Dtc_FechaCreacionUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Constructor general para carta o menú completo con elecciones e incluye.
    /// </summary>
    public DetalleComanda(
        Guid idComanda,
        Guid? idProducto,
        int? idMenuCompleto,
        string dtcNombreProducto,
        int dtcCantidad,
        string? dtcObservacion = null,
        string? dtcElecciones = null,
        string? dtcIncluye = null)
    {
        Id_DetalleComanda = Guid.NewGuid();
        Id_Comanda = idComanda;
        Id_Producto = idProducto;
        Id_MenuCompleto = idMenuCompleto;
        Dtc_NombreProducto = dtcNombreProducto.Trim();
        Dtc_Elecciones = string.IsNullOrWhiteSpace(dtcElecciones) ? null : dtcElecciones.Trim();
        Dtc_Incluye = string.IsNullOrWhiteSpace(dtcIncluye) ? null : dtcIncluye.Trim();
        Dtc_Cantidad = dtcCantidad;
        Dtc_Observacion = string.IsNullOrWhiteSpace(dtcObservacion) ? null : dtcObservacion.Trim();
        Dtc_FechaCreacionUtc = DateTime.UtcNow;
    }
}
