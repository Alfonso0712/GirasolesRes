using System.Text.Json.Serialization;

namespace GirasolesRes.Application.DTOs.MenuDia;

public class MenuDiaResponseDto
{
    [JsonPropertyName("fecha")]
    public string Fecha { get; set; } = string.Empty;

    [JsonPropertyName("definido")]
    public bool Definido { get; set; }

    [JsonPropertyName("desayuno")]
    public DesayunoMenuDto? Desayuno { get; set; }

    [JsonPropertyName("platos")]
    public List<PlatoMenuDto> Platos { get; set; } = new();
}

public class DesayunoMenuDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;
}

public class PlatoMenuDto
{
    [JsonPropertyName("productoId")]
    public Guid ProductoId { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("categoria")]
    public string Categoria { get; set; } = string.Empty;

    [JsonPropertyName("precio")]
    public decimal Precio { get; set; }

    [JsonPropertyName("agotado")]
    public bool Agotado { get; set; }
}

public class CandidatoMenuDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("categoria")]
    public string Categoria { get; set; } = string.Empty;

    [JsonPropertyName("precio")]
    public decimal Precio { get; set; }
}

public class GuardarMenuDiaRequest
{
    [JsonPropertyName("desayunoId")]
    public Guid? DesayunoId { get; set; }

    [JsonPropertyName("platoIds")]
    public List<Guid> PlatoIds { get; set; } = new();
}

public class CambiarDisponibilidadRequest
{
    [JsonPropertyName("agotado")]
    public bool Agotado { get; set; }
}

public class CambiarDisponibilidadResponseDto
{
    [JsonPropertyName("productoId")]
    public Guid ProductoId { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("agotado")]
    public bool Agotado { get; set; }
}
