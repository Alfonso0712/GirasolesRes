using System.Text.Json.Serialization;

namespace GirasolesRes.Application.DTOs.Auth;

public class LogoutRequest
{
    [JsonPropertyName("motivo")]
    public string Motivo { get; set; } = "manual";
}
