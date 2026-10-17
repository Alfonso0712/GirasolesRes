using System.Text.Json.Serialization;

namespace GirasolesRes.Application.DTOs.Mesas;

public class CambiarEstadoMesaRequest
{
    [JsonPropertyName("activa")]
    public bool Activa { get; set; }
}
