namespace GirasolesRes.Domain.Entities;

public class MenuDiaPlato
{
    public Guid Id_MenuPlato { get; private set; }
    public Guid Id_Menu { get; private set; }
    public MenuDia Mdp_MenuDia { get; private set; } = null!;

    public Guid Id_Producto { get; private set; }
    public Producto Mdp_Producto { get; private set; } = null!;

    public bool Mdp_Agotado { get; private set; }
    public DateTime? Mdp_FechaCambioDisponibilidadUtc { get; private set; }
    public string? Mdp_UsuarioDisponibilidad { get; private set; }

    // Constructor privado para EF Core
    private MenuDiaPlato() { }

    public MenuDiaPlato(Guid idMenu, Guid idProducto, bool mdpAgotado = false)
    {
        Id_MenuPlato = Guid.NewGuid();
        Id_Menu = idMenu;
        Id_Producto = idProducto;
        Mdp_Agotado = mdpAgotado;
    }

    public void CambiarDisponibilidad(bool agotado, string usuario)
    {
        Mdp_Agotado = agotado;
        Mdp_UsuarioDisponibilidad = usuario.Trim();
        Mdp_FechaCambioDisponibilidadUtc = DateTime.UtcNow;
    }
}
