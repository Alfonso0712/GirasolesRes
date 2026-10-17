namespace GirasolesRes.Domain.Entities;

public class MenuDia
{
    public Guid Id { get; private set; }
    public DateOnly Fecha { get; private set; }
    
    public Guid? DesayunoId { get; private set; }
    public Producto? Desayuno { get; private set; }

    public DateTime FechaCreacionUtc { get; private set; }
    public DateTime? FechaActualizacionUtc { get; private set; }
    public string UsuarioCreacion { get; private set; } = string.Empty;
    public string? UsuarioActualizacion { get; private set; }

    private readonly List<MenuDiaPlato> _platos = new();
    public IReadOnlyCollection<MenuDiaPlato> Platos => _platos.AsReadOnly();

    // Constructor privado para EF Core
    private MenuDia() { }

    public MenuDia(DateOnly fecha, Guid? desayunoId, string usuarioCreacion)
    {
        Id = Guid.NewGuid();
        Fecha = fecha;
        DesayunoId = desayunoId;
        UsuarioCreacion = usuarioCreacion;
        FechaCreacionUtc = DateTime.UtcNow;
    }

    public void ActualizarDesayuno(Guid? desayunoId, string usuario)
    {
        DesayunoId = desayunoId;
        UsuarioActualizacion = usuario;
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void SincronizarPlatos(IEnumerable<Guid> nuevosProductoIds, string usuario)
    {
        var idsSet = nuevosProductoIds.Distinct().ToHashSet();

        // Remover los que ya no están
        _platos.RemoveAll(p => !idsSet.Contains(p.ProductoId));

        // Agregar los nuevos conservando el estado de los que ya existían
        foreach (var id in idsSet)
        {
            if (!_platos.Any(p => p.ProductoId == id))
            {
                _platos.Add(new MenuDiaPlato(Id, id, agotado: false));
            }
        }

        UsuarioActualizacion = usuario;
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public bool CambiarDisponibilidadPlato(Guid productoId, bool agotado, string usuario)
    {
        var plato = _platos.FirstOrDefault(p => p.ProductoId == productoId);
        if (plato == null)
            return false;

        plato.CambiarDisponibilidad(agotado, usuario);
        UsuarioActualizacion = usuario;
        FechaActualizacionUtc = DateTime.UtcNow;
        return true;
    }

    public void RemoverProducto(Guid productoId, string usuario)
    {
        if (DesayunoId == productoId)
        {
            DesayunoId = null;
        }

        _platos.RemoveAll(p => p.ProductoId == productoId);
        UsuarioActualizacion = usuario;
        FechaActualizacionUtc = DateTime.UtcNow;
    }
}
