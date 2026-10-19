using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class MenuCompletoParte
{
    public int Id_Parte { get; private set; }
    public int Id_MenuCompleto { get; private set; }
    public MenuCompleto? Men_MenuCompleto { get; private set; }
    public string Par_Nombre { get; private set; } = string.Empty;
    public List<RolComponente> Par_RolesPermitidos { get; private set; } = new();
    public int Par_Orden { get; private set; }

    // Constructor privado para EF Core
    private MenuCompletoParte() { }

    public MenuCompletoParte(
        int idMenuCompleto,
        string parNombre,
        IEnumerable<RolComponente> rolesPermitidos,
        int parOrden)
    {
        Id_MenuCompleto = idMenuCompleto;
        Par_Nombre = parNombre.Trim();
        Par_RolesPermitidos = rolesPermitidos.ToList();
        Par_Orden = parOrden;
    }
}
