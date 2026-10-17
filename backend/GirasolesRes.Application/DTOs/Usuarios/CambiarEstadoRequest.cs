using System.Text.Json.Serialization;

namespace GirasolesRes.Application.DTOs.Usuarios;

public class CambiarEstadoRequest
{
    [JsonPropertyName("activo")]
    public bool Activo { get; set; }
}
