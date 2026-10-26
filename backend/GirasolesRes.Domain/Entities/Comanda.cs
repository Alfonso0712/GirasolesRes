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
    public bool Cmd_Modificada { get; private set; } = false;
    public bool Cmd_AvisoVisto { get; private set; } = false;
    public DateTime? Cmd_FechaAvisoVistoUtc { get; private set; }
    public string? Cmd_UsuarioAvisoVisto { get; private set; }
    public string Cmd_NombreMesa { get; private set; } = string.Empty;
    public DateTime Cmd_FechaCreacionUtc { get; private set; }
    public DateTime? Cmd_FecInicioPreparacionUtc { get; private set; }
    public string? Cmd_NomUsuarioPreparacion { get; private set; }
    public DateTime? Cmd_FecListaUtc { get; private set; }
    public string? Cmd_NomUsuarioLista { get; private set; }
    public EstadoComanda? Cmd_EstadoAnterior { get; private set; }
    public DateTime? Cmd_FecUltimoCambioEstadoUtc { get; private set; }

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

    public void AgregarDetalle(
        Guid? idProducto,
        int? idMenuCompleto,
        string nombreProducto,
        int cantidad,
        string? observacion,
        string? elecciones = null,
        string? incluye = null)
    {
        _cmd_Detalles.Add(new DetalleComanda(Id_Comanda, idProducto, idMenuCompleto, nombreProducto, cantidad, observacion, elecciones, incluye));
    }

    public void IniciarPreparacion(string usuario)
    {
        if (string.IsNullOrWhiteSpace(usuario))
            throw new ArgumentException("El usuario es obligatorio.", nameof(usuario));

        if (Cmd_Estado != EstadoComanda.Pendiente)
            throw new InvalidOperationException($"Solo una comanda en estado Pendiente puede pasar a En preparación. Estado actual: {Cmd_Estado}.");

        Cmd_EstadoAnterior = Cmd_Estado;
        Cmd_Estado = EstadoComanda.EnPreparacion;
        Cmd_FecInicioPreparacionUtc = DateTime.UtcNow;
        Cmd_NomUsuarioPreparacion = usuario.Trim();
        Cmd_FecUltimoCambioEstadoUtc = DateTime.UtcNow;
    }

    public void MarcarComoLista(string usuario)
    {
        if (string.IsNullOrWhiteSpace(usuario))
            throw new ArgumentException("El usuario es obligatorio.", nameof(usuario));

        if (Cmd_Estado != EstadoComanda.EnPreparacion)
            throw new InvalidOperationException($"Solo una comanda en preparación puede marcarse como lista. Estado actual: {Cmd_Estado}.");

        Cmd_EstadoAnterior = Cmd_Estado;
        Cmd_Estado = EstadoComanda.Lista;
        Cmd_FecListaUtc = DateTime.UtcNow;
        Cmd_NomUsuarioLista = usuario.Trim();
        Cmd_AvisoVisto = false;
        Cmd_FechaAvisoVistoUtc = null;
        Cmd_UsuarioAvisoVisto = null;
        Cmd_FecUltimoCambioEstadoUtc = DateTime.UtcNow;
    }

    public void DeshacerUltimoEstado()
    {
        if (!Cmd_EstadoAnterior.HasValue)
            throw new InvalidOperationException("No se puede deshacer: la comanda no tiene un estado anterior registrado.");

        var estadoARevertir = Cmd_Estado;
        Cmd_Estado = Cmd_EstadoAnterior.Value;
        Cmd_EstadoAnterior = null;
        Cmd_FecUltimoCambioEstadoUtc = DateTime.UtcNow;

        if (estadoARevertir == EstadoComanda.EnPreparacion)
        {
            Cmd_FecInicioPreparacionUtc = null;
            Cmd_NomUsuarioPreparacion = null;
        }
        else if (estadoARevertir == EstadoComanda.Lista)
        {
            Cmd_FecListaUtc = null;
            Cmd_NomUsuarioLista = null;
            // Si el aviso no fue visto, se retira/invalida
            Cmd_AvisoVisto = true;
        }
    }

    public void Cancelar()
    {
        if (Cmd_Estado == EstadoComanda.Cancelada)
            return;

        Cmd_EstadoAnterior = Cmd_Estado;
        Cmd_Estado = EstadoComanda.Cancelada;
        Cmd_FecUltimoCambioEstadoUtc = DateTime.UtcNow;
    }

    public void MarcarComoModificada()
    {
        Cmd_Modificada = true;
    }

    public void MarcarAvisoVisto(string usuario)
    {
        Cmd_AvisoVisto = true;
        Cmd_FechaAvisoVistoUtc = DateTime.UtcNow;
        Cmd_UsuarioAvisoVisto = usuario.Trim();
    }

    public void ReemplazarDetalles(IEnumerable<DetalleComanda> nuevosDetalles)
    {
        _cmd_Detalles.Clear();
        _cmd_Detalles.AddRange(nuevosDetalles);
        Cmd_Modificada = true;
    }
}
