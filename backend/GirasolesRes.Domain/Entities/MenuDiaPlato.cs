namespace GirasolesRes.Domain.Entities;

public class MenuDiaPlato
{
    public Guid Id { get; private set; }
    public Guid MenuDiaId { get; private set; }
    public MenuDia MenuDia { get; private set; } = null!;

    public Guid ProductoId { get; private set; }
    public Producto Producto { get; private set; } = null!;

    public bool Agotado { get; private set; }
    public DateTime? FechaCambioDisponibilidadUtc { get; private set; }
    public string? UsuarioCambioDisponibilidad { get; private set; }

    // Constructor privado para EF Core
    private MenuDiaPlato() { }

    public MenuDiaPlato(Guid menuDiaId, Guid productoId, bool agotado = false)
    {
        Id = Guid.NewGuid();
        MenuDiaId = menuDiaId;
        ProductoId = productoId;
        Agotado = agotado;
    }

    public void CambiarDisponibilidad(bool agotado, string usuario)
    {
        Agotado = agotado;
        UsuarioCambioDisponibilidad = usuario;
        FechaCambioDisponibilidadUtc = DateTime.UtcNow;
    }
}
