namespace GirasolesRes.Domain.Entities;

public class DetallePedido
{
    public Guid Id_Detalle { get; private set; }
    public Guid Id_Pedido { get; private set; }
    public Pedido? Det_Pedido { get; private set; }

    public Guid Id_Producto { get; private set; }
    public Producto? Det_Producto { get; private set; }

    public int Det_Cantidad { get; private set; }
    public decimal Det_PrecioUnitario { get; private set; }
    public decimal Det_Subtotal { get; private set; }
    public string? Det_Observacion { get; private set; }
    public DateTime Det_FechaCreacionUtc { get; private set; }

    // Constructor privado para EF Core
    private DetallePedido() { }

    public DetallePedido(
        Guid idPedido,
        Guid idProducto,
        int detCantidad,
        decimal detPrecioUnitario,
        string? detObservacion = null)
    {
        Id_Detalle = Guid.NewGuid();
        Id_Pedido = idPedido;
        Id_Producto = idProducto;
        Det_Cantidad = detCantidad;
        Det_PrecioUnitario = decimal.Round(detPrecioUnitario, 2);
        Det_Subtotal = decimal.Round(detCantidad * detPrecioUnitario, 2);
        Det_Observacion = string.IsNullOrWhiteSpace(detObservacion) ? null : detObservacion.Trim();
        Det_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void AumentarCantidad(int adicional)
    {
        if (adicional <= 0) return;
        Det_Cantidad += adicional;
        Det_Subtotal = decimal.Round(Det_Cantidad * Det_PrecioUnitario, 2);
    }
}
