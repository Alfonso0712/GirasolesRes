namespace GirasolesRes.Application.DTOs.Mesas;

public record MesaDto(
    Guid Id,
    string Nombre,
    string Ocupacion,
    bool Activa
)
{
    // Propiedades puente de compatibilidad con prefijos de cátedra
    public Guid Id_Mesa => Id;
    public string Nom_Mesa => Nombre;
    public string Est_Mesa => Ocupacion;
    public bool Est_Activa => Activa;
}
