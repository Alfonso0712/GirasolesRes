namespace GirasolesRes.Domain.Entities;

public class MenuDiaMenuCompleto
{
    public Guid Id_MenuDiaMenuCompleto { get; private set; }
    
    public Guid Id_Menu { get; private set; }
    public MenuDia Mmc_MenuDia { get; private set; } = null!;

    public int Id_MenuCompleto { get; private set; }
    public MenuCompleto Mmc_MenuCompleto { get; private set; } = null!;

    public DateTime Mmc_FechaCreacionUtc { get; private set; }

    // Constructor privado para EF Core
    private MenuDiaMenuCompleto() { }

    public MenuDiaMenuCompleto(Guid idMenu, int idMenuCompleto)
    {
        Id_MenuDiaMenuCompleto = Guid.NewGuid();
        Id_Menu = idMenu;
        Id_MenuCompleto = idMenuCompleto;
        Mmc_FechaCreacionUtc = DateTime.UtcNow;
    }
}
