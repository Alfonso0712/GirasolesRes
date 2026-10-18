using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Comanda
{
    public Guid Id_Comanda { get; private set; }
    public Guid Id_Pedido { get; private set; }
    public Pedido? Cmd_Pedido { get; private set; }

    public int Cmd_NumeroDiario { get; private set; }
    public DateTime Cmd_FechaHoraUtc { get; private set; }
    public EstadoComanda Cmd_Estado { get; private set; } = EstadoComanda.Pendiente;
    public bool Cmd_EsAdicional { get; private set; } = false;
    public string Cmd_NombreMesa { get; private set; } = string.Empty;
    public DateTime Cmd_FechaCreacionUtc { get; private set; }

    private readonly List<DetalleComanda> _cmd_Detalles = new();
    public IReadOnlyCollection<DetalleComanda> Cmd_Detalles => _cmd_Detalles.AsReadOnly();

    // Constructor privado para EF Core
    private Comanda() { }

    public Comanda(
        Guid idPedido,
        int cmdNumeroDiario,
        string cmdNombreMesa,
        bool cmdEsAdicional = false)
    {
        Id_Comanda = Guid.NewGuid();
        Id_Pedido = idPedido;
        Cmd_NumeroDiario = cmdNumeroDiario;
        Cmd_FechaHoraUtc = DateTime.UtcNow;
        Cmd_Estado = EstadoComanda.Pendiente;
        Cmd_EsAdicional = cmdEsAdicional;
        Cmd_NombreMesa = cmdNombreMesa.Trim();
        Cmd_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void AgregarDetalle(Guid idProducto, string nombreProducto, int cantidad, string? observacion)
    {
        _cmd_Detalles.Add(new DetalleComanda(Id_Comanda, idProducto, nombreProducto, cantidad, observacion));
    }

    public void CambiarEstado(EstadoComanda nuevoEstado)
    {
        Cmd_Estado = nuevoEstado;
    }
}
