using System.Text.Json.Serialization;

namespace GirasolesRes.Application.DTOs.Usuarios;

public class PaginacionUsuariosResponse
{
    [JsonPropertyName("items")]
    public List<UsuarioResponseDto> Items { get; set; } = new();

    [JsonPropertyName("total")]
    public int Total { get; set; }
}
