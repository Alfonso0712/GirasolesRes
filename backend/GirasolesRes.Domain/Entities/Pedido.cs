using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Pedido
{
    public Guid Id_Pedido { get; private set; }
    public int Ped_NumeroDiario { get; private set; }
    public DateOnly Ped_FechaOperativa { get; private set; }
    public DateTime Ped_FechaHoraUtc { get; private set; }
    public TipoPedido Ped_Tipo { get; private set; } = TipoPedido.Mesa;
    public EstadoPedido Ped_Estado { get; private set; } = EstadoPedido.Pendiente;
    public decimal Ped_Total { get; private set; }
    public string? Ped_Notas { get; private set; }

    public Guid? Id_Mesa { get; private set; }
    public Mesa? Ped_Mesa { get; private set; }

    public Guid Id_Usuario { get; private set; }
    public Usuario? Ped_Usuario { get; private set; }

    public string Ped_SolicitudId { get; private set; } = string.Empty;
    public string? Ped_MotivoAnulacion { get; private set; }
    public DateTime Ped_FechaCreacionUtc { get; private set; }
    public DateTime? Ped_FechaActualizacionUtc { get; private set; }

    private readonly List<DetallePedido> _ped_Detalles = new();
    public IReadOnlyCollection<DetallePedido> Ped_Detalles => _ped_Detalles.AsReadOnly();

    private readonly List<Comanda> _ped_Comandas = new();
    public IReadOnlyCollection<Comanda> Ped_Comandas => _ped_Comandas.AsReadOnly();

    // Constructor privado para EF Core
    private Pedido() { }

    public Pedido(
        int pedNumeroDiario,
        DateOnly pedFechaOperativa,
        Guid? idMesa,
        Guid idUsuario,
        string pedSolicitudId,
        TipoPedido pedTipo = TipoPedido.Mesa,
        string? pedNotas = null)
    {
        Id_Pedido = Guid.NewGuid();
        Ped_NumeroDiario = pedNumeroDiario;
        Ped_FechaOperativa = pedFechaOperativa;
        Ped_FechaHoraUtc = DateTime.UtcNow;
        Ped_Tipo = pedTipo;
        Ped_Estado = EstadoPedido.Pendiente;
        Id_Mesa = idMesa;
        Id_Usuario = idUsuario;
        Ped_SolicitudId = pedSolicitudId.Trim();
        Ped_Notas = string.IsNullOrWhiteSpace(pedNotas) ? null : pedNotas.Trim();
        Ped_Total = 0.00m;
        Ped_FechaCreacionUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Regla: Agregar el mismo producto con la misma observación suma la cantidad; con otra observación crea otra línea.
    /// Cantidad entera de 1 a 20 por línea.
    /// </summary>
    public DetallePedido AgregarOLinea(Guid idProducto, string nombreProducto, int cantidad, decimal precioUnitario, string? observacion)
    {
        var obsNormalizada = string.IsNullOrWhiteSpace(observacion) ? null : observacion.Trim();

        var lineaExistente = _ped_Detalles.FirstOrDefault(d =>
            d.Id_Producto == idProducto &&
            string.Equals(d.Det_Observacion, obsNormalizada, StringComparison.OrdinalIgnoreCase));

        if (lineaExistente != null)
        {
            var nuevaCantidad = lineaExistente.Det_Cantidad + cantidad;
            if (nuevaCantidad > 20)
            {
                throw new InvalidOperationException("La cantidad acumulada por línea no puede superar 20.");
            }
            lineaExistente.AumentarCantidad(cantidad);
            RecalcularTotal();
            return lineaExistente;
        }

        if (cantidad < 1 || cantidad > 20)
        {
            throw new ArgumentOutOfRangeException(nameof(cantidad), "La cantidad debe ser un número entero entre 1 y 20.");
        }

        var nuevaLinea = new DetallePedido(Id_Pedido, idProducto, nombreProducto, cantidad, precioUnitario, obsNormalizada);
        _ped_Detalles.Add(nuevaLinea);
        RecalcularTotal();
        return nuevaLinea;
    }

    public DetallePedido AgregarOLinea(Guid idProducto, int cantidad, decimal precioUnitario, string? observacion)
        => AgregarOLinea(idProducto, string.Empty, cantidad, precioUnitario, observacion);

    /// <summary>
    /// Regla RV-164/RV-165: Agregar el mismo menú completo con las mismas opciones y la misma nota
    /// suma la cantidad; si cambia alguna opción o nota, crea otra línea.
    /// </summary>
    public DetallePedido AgregarOLineaMenuCompleto(
        int idMenuCompleto,
        string nombreMenu,
        string? incluye,
        int cantidad,
        decimal precioUnitario,
        string? observacion,
        List<(string ParteNombre, Guid ProductoId, string ProductoNombre)> opciones)
    {
        var obsNormalizada = string.IsNullOrWhiteSpace(observacion) ? null : observacion.Trim();

        var lineaExistente = _ped_Detalles.FirstOrDefault(d =>
            d.Id_MenuCompleto == idMenuCompleto &&
            string.Equals(d.Det_Observacion, obsNormalizada, StringComparison.OrdinalIgnoreCase) &&
            d.Det_Opciones.Count == opciones.Count &&
            opciones.All(o => d.Det_Opciones.Any(doOp =>
                string.Equals(doOp.Lpo_ParteNombre, o.ParteNombre, StringComparison.OrdinalIgnoreCase) &&
                doOp.Id_Producto == o.ProductoId)));

        if (lineaExistente != null)
        {
            var nuevaCantidad = lineaExistente.Det_Cantidad + cantidad;
            if (nuevaCantidad > 20)
            {
                throw new InvalidOperationException("La cantidad acumulada por línea no puede superar 20.");
            }
            lineaExistente.AumentarCantidad(cantidad);
            RecalcularTotal();
            return lineaExistente;
        }

        if (cantidad < 1 || cantidad > 20)
        {
            throw new ArgumentOutOfRangeException(nameof(cantidad), "La cantidad debe ser un número entero entre 1 y 20.");
        }

        var nuevaLinea = new DetallePedido(Id_Pedido, idMenuCompleto, nombreMenu, incluye, cantidad, precioUnitario, obsNormalizada);
        foreach (var op in opciones)
        {
            nuevaLinea.AgregarOpcion(op.ParteNombre, op.ProductoId, op.ProductoNombre);
        }

        _ped_Detalles.Add(nuevaLinea);
        RecalcularTotal();
        return nuevaLinea;
    }

    public void RecalcularTotal()
    {
        Ped_Total = decimal.Round(_ped_Detalles.Sum(d => d.Det_Subtotal), 2);
        Ped_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarEstado(EstadoPedido nuevoEstado)
    {
        Ped_Estado = nuevoEstado;
        Ped_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void Anular(string motivo)
    {
        Ped_Estado = EstadoPedido.Anulado;
        Ped_MotivoAnulacion = motivo.Trim();
        Ped_FechaActualizacionUtc = DateTime.UtcNow;

        foreach (var comanda in _ped_Comandas)
        {
            comanda.CambiarEstado(EstadoComanda.Cancelada);
        }
    }

    public void ModificarLineas(List<DetallePedido> nuevasLineas)
    {
        _ped_Detalles.Clear();
        _ped_Detalles.AddRange(nuevasLineas);
        RecalcularTotal();
    }

    public void AgregarComanda(Comanda comanda)
    {
        _ped_Comandas.Add(comanda);
        Ped_FechaActualizacionUtc = DateTime.UtcNow;
    }
}
