namespace GirasolesRes.Application.Common.Exceptions;

public class PedidoConflictException : Exception
{
    public string Codigo { get; }
    public IReadOnlyList<Guid>? ProductosAgotados { get; }

    public PedidoConflictException(string codigo, string mensaje, IReadOnlyList<Guid>? productosAgotados = null)
        : base(mensaje)
    {
        Codigo = codigo;
        ProductosAgotados = productosAgotados;
    }
}
