namespace GirasolesRes.Domain.Entities;

public class LineaPedidoOpcion
{
    public Guid Id_LineaPedidoOpcion { get; private set; }
    
    public Guid Id_DetallePedido { get; private set; }
    public DetallePedido? Lpo_DetallePedido { get; private set; }

    public string Lpo_ParteNombre { get; private set; } = string.Empty;

    public Guid Id_Producto { get; private set; }
    public Producto? Lpo_Producto { get; private set; }

    public string Lpo_ProductoNombre { get; private set; } = string.Empty;

    public DateTime Lpo_FechaCreacionUtc { get; private set; }

    // Constructor privado para EF Core
    private LineaPedidoOpcion() { }

    public LineaPedidoOpcion(
        Guid idDetallePedido,
        string lpoParteNombre,
        Guid idProducto,
        string lpoProductoNombre)
    {
        Id_LineaPedidoOpcion = Guid.NewGuid();
        Id_DetallePedido = idDetallePedido;
        Lpo_ParteNombre = lpoParteNombre.Trim();
        Id_Producto = idProducto;
        Lpo_ProductoNombre = lpoProductoNombre.Trim();
        Lpo_FechaCreacionUtc = DateTime.UtcNow;
    }
}
