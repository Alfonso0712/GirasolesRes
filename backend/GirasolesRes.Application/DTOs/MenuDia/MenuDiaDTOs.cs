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

    [JsonPropertyName("opciones")]
    public List<OpcionMenuDto> Opciones { get; set; } = new();

    [JsonPropertyName("menusCompletos")]
    public List<MenuCompletoDiaDto> MenusCompletos { get; set; } = new();
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

public class OpcionMenuDto
{
    [JsonPropertyName("productoId")]
    public Guid ProductoId { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("rol")]
    public string Rol { get; set; } = string.Empty;

    [JsonPropertyName("agotado")]
    public bool Agotado { get; set; }
}

public class MenuCompletoDiaDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("precio")]
    public decimal Precio { get; set; }

    [JsonPropertyName("incluye")]
    public string? Incluye { get; set; }

    [JsonPropertyName("disponible")]
    public bool Disponible { get; set; }

    [JsonPropertyName("motivoNoDisponible")]
    public string? MotivoNoDisponible { get; set; }

    [JsonPropertyName("partes")]
    public List<MenuCompletoParteDiaDto> Partes { get; set; } = new();
}

public class MenuCompletoParteDiaDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("orden")]
    public int Orden { get; set; }

    [JsonPropertyName("rolesPermitidos")]
    public List<string> RolesPermitidos { get; set; } = new();

    [JsonPropertyName("opciones")]
    public List<OpcionParteDiaDto> Opciones { get; set; } = new();
}

public class OpcionParteDiaDto
{
    [JsonPropertyName("productoId")]
    public Guid ProductoId { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("agotado")]
    public bool Agotado { get; set; }
}

public class CandidatoMenuDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("tipo")]
    public string Tipo { get; set; } = "Carta";

    [JsonPropertyName("rol")]
    public string? Rol { get; set; }

    [JsonPropertyName("categoria")]
    public string? Categoria { get; set; }

    [JsonPropertyName("precio")]
    public decimal? Precio { get; set; }
}

public class GuardarMenuDiaRequest
{
    [JsonPropertyName("productosCarta")]
    public List<Guid>? ProductosCarta { get; set; }

    [JsonPropertyName("opciones")]
    public List<Guid>? Opciones { get; set; }

    [JsonPropertyName("menusCompletos")]
    public List<int>? MenusCompletos { get; set; }



    [JsonPropertyName("platoIds")]
    public List<Guid>? PlatoIds { get; set; }
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
