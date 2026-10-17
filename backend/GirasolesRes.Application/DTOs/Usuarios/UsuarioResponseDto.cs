using System.Text.Json.Serialization;

namespace GirasolesRes.Application.DTOs.Usuarios;

public class UsuarioResponseDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("usuario")]
    public string Usuario { get; set; } = string.Empty;

    [JsonPropertyName("correo")]
    public string? Correo { get; set; }

    [JsonPropertyName("rol")]
    public string Rol { get; set; } = string.Empty;

    [JsonPropertyName("activo")]
    public bool Activo { get; set; }

    [JsonPropertyName("fechaCreacion")]
    public DateTime FechaCreacion { get; set; }

    // Propiedades puente de compatibilidad con prefijos de cátedra
    public Guid Id_Usuario => Id;
    public string Nom_Completo => Nombre;
    public string Nom_Usuario => Usuario;
    public string? Cor_Usuario => Correo;
    public string Rol_Usuario => Rol;
    public bool Est_Usuario => Activo;
    public DateTime Fec_Creacion => FechaCreacion;
}
