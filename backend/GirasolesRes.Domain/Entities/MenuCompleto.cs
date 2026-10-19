namespace GirasolesRes.Domain.Entities;

public class MenuCompleto
{
    public int Id_MenuCompleto { get; private set; }
    public string Men_Nombre { get; private set; } = string.Empty;
    public decimal Men_Precio { get; private set; }
    public bool Men_Activo { get; private set; }
    public string? Men_Incluye { get; private set; }
    public DateTime? Men_FechaActualizacionUtc { get; private set; }

    private readonly List<MenuCompletoParte> _men_Partes = new();
    public IReadOnlyCollection<MenuCompletoParte> Men_Partes => _men_Partes.AsReadOnly();

    // Constructor privado para EF Core
    private MenuCompleto() { }

    public MenuCompleto(
        int idMenuCompleto,
        string menNombre,
        decimal menPrecio,
        bool menActivo = true,
        string? menIncluye = null)
    {
        Id_MenuCompleto = idMenuCompleto;
        Men_Nombre = menNombre.Trim();
        Men_Precio = decimal.Round(menPrecio, 2);
        Men_Activo = menActivo;
        Men_Incluye = string.IsNullOrWhiteSpace(menIncluye) ? null : menIncluye.Trim();
    }

    public void ActualizarPrecio(decimal nuevoPrecio)
    {
        Men_Precio = decimal.Round(nuevoPrecio, 2);
        Men_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarEstado(bool activo)
    {
        Men_Activo = activo;
        Men_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void AgregarParte(MenuCompletoParte parte)
    {
        _men_Partes.Add(parte);
    }
}
