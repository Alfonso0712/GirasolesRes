namespace GirasolesRes.Domain.Entities;

public class DetallePedido
{
    public Guid Id_Detalle { get; private set; }
    public Guid Id_Pedido { get; private set; }
    public Pedido? Det_Pedido { get; private set; }

    public Guid? Id_Producto { get; private set; }
    public Producto? Det_Producto { get; private set; }

    public int? Id_MenuCompleto { get; private set; }
    public MenuCompleto? Det_MenuCompleto { get; private set; }

    public string Det_Nombre { get; private set; } = string.Empty;
    public string? Det_Incluye { get; private set; }

    public int Det_Cantidad { get; private set; }
    public decimal Det_PrecioUnitario { get; private set; }
    public decimal Det_Subtotal { get; private set; }
    public string? Det_Observacion { get; private set; }
    public DateTime Det_FechaCreacionUtc { get; private set; }

    private readonly List<LineaPedidoOpcion> _det_Opciones = new();
    public IReadOnlyCollection<LineaPedidoOpcion> Det_Opciones => _det_Opciones.AsReadOnly();

    // Constructor privado para EF Core
    private DetallePedido() { }

    /// <summary>
    /// Constructor para producto de carta tradicional.
    /// </summary>
    public DetallePedido(
        Guid idPedido,
        Guid idProducto,
        string detNombre,
        int detCantidad,
        decimal detPrecioUnitario,
        string? detObservacion = null)
    {
        Id_Detalle = Guid.NewGuid();
        Id_Pedido = idPedido;
        Id_Producto = idProducto;
        Id_MenuCompleto = null;
        Det_Nombre = detNombre.Trim();
        Det_Incluye = null;
        Det_Cantidad = detCantidad;
        Det_PrecioUnitario = decimal.Round(detPrecioUnitario, 2);
        Det_Subtotal = decimal.Round(detCantidad * detPrecioUnitario, 2);
        Det_Observacion = string.IsNullOrWhiteSpace(detObservacion) ? null : detObservacion.Trim();
        Det_FechaCreacionUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Constructor de compatibilidad para producto de carta sin nombre explícito.
    /// </summary>
    public DetallePedido(
        Guid idPedido,
        Guid idProducto,
        int detCantidad,
        decimal detPrecioUnitario,
        string? detObservacion = null)
        : this(idPedido, idProducto, string.Empty, detCantidad, detPrecioUnitario, detObservacion)
    {
    }

    /// <summary>
    /// Constructor para menú completo con precio fijo y opciones seleccionadas.
    /// </summary>
    public DetallePedido(
        Guid idPedido,
        int idMenuCompleto,
        string detNombre,
        string? detIncluye,
        int detCantidad,
        decimal detPrecioUnitario,
        string? detObservacion = null)
    {
        Id_Detalle = Guid.NewGuid();
        Id_Pedido = idPedido;
        Id_Producto = null;
        Id_MenuCompleto = idMenuCompleto;
        Det_Nombre = detNombre.Trim();
        Det_Incluye = string.IsNullOrWhiteSpace(detIncluye) ? null : detIncluye.Trim();
        Det_Cantidad = detCantidad;
        Det_PrecioUnitario = decimal.Round(detPrecioUnitario, 2);
        Det_Subtotal = decimal.Round(detCantidad * detPrecioUnitario, 2);
        Det_Observacion = string.IsNullOrWhiteSpace(detObservacion) ? null : detObservacion.Trim();
        Det_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void AgregarOpcion(string parteNombre, Guid idProducto, string productoNombre)
    {
        _det_Opciones.Add(new LineaPedidoOpcion(Id_Detalle, parteNombre, idProducto, productoNombre));
    }

    public void AumentarCantidad(int adicional)
    {
        if (adicional <= 0) return;
        Det_Cantidad += adicional;
        Det_Subtotal = decimal.Round(Det_Cantidad * Det_PrecioUnitario, 2);
    }
}
