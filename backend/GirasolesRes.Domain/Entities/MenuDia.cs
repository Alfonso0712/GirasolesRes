namespace GirasolesRes.Domain.Entities;

public class MenuDia
{
    public Guid Id_Menu { get; private set; }
    public DateOnly Men_Fecha { get; private set; }
    
    public Guid? Id_Desayuno { get; private set; }
    public Producto? Men_Desayuno { get; private set; }

    public DateTime Men_FechaCreacionUtc { get; private set; }
    public DateTime? Men_FechaActualizacionUtc { get; private set; }
    public string Men_UsuarioCreacion { get; private set; } = string.Empty;
    public string? Men_UsuarioActualizacion { get; private set; }

    private readonly List<MenuDiaPlato> _platos = new();
    public IReadOnlyCollection<MenuDiaPlato> Men_Platos => _platos.AsReadOnly();

    // Constructor privado para EF Core
    private MenuDia() { }

    public MenuDia(DateOnly menFecha, Guid? idDesayuno, string menUsuarioCreacion)
    {
        Id_Menu = Guid.NewGuid();
        Men_Fecha = menFecha;
        Id_Desayuno = idDesayuno;
        Men_UsuarioCreacion = menUsuarioCreacion.Trim();
        Men_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void ActualizarDesayuno(Guid? idDesayuno, string usuario)
    {
        Id_Desayuno = idDesayuno;
        Men_UsuarioActualizacion = usuario.Trim();
        Men_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void SincronizarPlatos(IEnumerable<Guid> nuevosProductoIds, string usuario)
    {
        var idsSet = nuevosProductoIds.Distinct().ToHashSet();

        // Remover los que ya no están
        _platos.RemoveAll(p => !idsSet.Contains(p.Id_Producto));

        // Agregar los nuevos conservando el estado de los que ya existían
        foreach (var id in idsSet)
        {
            if (!_platos.Any(p => p.Id_Producto == id))
            {
                _platos.Add(new MenuDiaPlato(Id_Menu, id, mdpAgotado: false));
            }
        }

        Men_UsuarioActualizacion = usuario.Trim();
        Men_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public bool CambiarDisponibilidadPlato(Guid productoId, bool agotado, string usuario)
    {
        var plato = _platos.FirstOrDefault(p => p.Id_Producto == productoId);
        if (plato == null)
            return false;

        plato.CambiarDisponibilidad(agotado, usuario);
        Men_UsuarioActualizacion = usuario.Trim();
        Men_FechaActualizacionUtc = DateTime.UtcNow;
        return true;
    }

    public void RemoverProducto(Guid productoId, string usuario)
    {
        if (Id_Desayuno == productoId)
        {
            Id_Desayuno = null;
        }

        _platos.RemoveAll(p => p.Id_Producto == productoId);
        Men_UsuarioActualizacion = usuario.Trim();
        Men_FechaActualizacionUtc = DateTime.UtcNow;
    }
}
