using System.Net.Http.Json;
using System.Text.Json.Serialization;
using GirasolesRes.Application.DTOs.Consultas;
using GirasolesRes.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GirasolesRes.Infrastructure.Services;

public class ConsultaDocumentoService : IConsultaDocumentoService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ConsultaDocumentoService> _logger;

    public ConsultaDocumentoService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ConsultaDocumentoService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    private (string baseUrl, string token) ObtenerCredenciales()
    {
        var baseUrl = _configuration["ApisPeru:BaseUrl"] ?? "https://dniruc.apisperu.com/api/v1";
        var token = _configuration["ApisPeru:Token"] ?? "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImNqYXp6dGluN0BnbWFpbC5jb20ifQ.5NcXq2oQNzTUSEHiGwzZvCqY57fktdSPdBx9kjkXw8k";
        return (baseUrl.TrimEnd('/'), token.Trim());
    }

    public async Task<ConsultaDniResultadoDto?> ConsultarDniAsync(string dni, CancellationToken ct = default)
    {
        var dniLimpio = dni?.Trim() ?? string.Empty;
        if (dniLimpio.Length != 8 || !dniLimpio.All(char.IsDigit))
        {
            throw new ArgumentException("El DNI debe contener exactamente 8 dígitos numéricos.");
        }

        var (baseUrl, token) = ObtenerCredenciales();
        var url = $"{baseUrl}/dni/{dniLimpio}?token={token}";

        try
        {
            using var response = await _httpClient.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Consulta DNI {Dni} respondió con status code {StatusCode}", dniLimpio, response.StatusCode);
                return null;
            }

            var apiRes = await response.Content.ReadFromJsonAsync<ApisPeruDniResponse>(cancellationToken: ct);
            if (apiRes == null || apiRes.Success == false)
            {
                return null;
            }

            var nombres = apiRes.Nombres?.Trim() ?? string.Empty;
            var apPaterno = apiRes.ApellidoPaterno?.Trim() ?? string.Empty;
            var apMaterno = apiRes.ApellidoMaterno?.Trim() ?? string.Empty;
            var nombreCompleto = $"{nombres} {apPaterno} {apMaterno}".Trim();

            return new ConsultaDniResultadoDto(
                Dni: apiRes.Dni ?? dniLimpio,
                Nombres: nombres,
                ApellidoPaterno: apPaterno,
                ApellidoMaterno: apMaterno,
                NombreCompleto: nombreCompleto
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar DNI {Dni} en ApisPeru", dniLimpio);
            throw;
        }
    }

    public async Task<ConsultaRucResultadoDto?> ConsultarRucAsync(string ruc, CancellationToken ct = default)
    {
        var rucLimpio = ruc?.Trim() ?? string.Empty;
        if (rucLimpio.Length != 11 || !rucLimpio.All(char.IsDigit))
        {
            throw new ArgumentException("El RUC debe contener exactamente 11 dígitos numéricos.");
        }

        var (baseUrl, token) = ObtenerCredenciales();
        var url = $"{baseUrl}/ruc/{rucLimpio}?token={token}";

        try
        {
            using var response = await _httpClient.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Consulta RUC {Ruc} respondió con status code {StatusCode}", rucLimpio, response.StatusCode);
                return null;
            }

            var apiRes = await response.Content.ReadFromJsonAsync<ApisPeruRucResponse>(cancellationToken: ct);
            if (apiRes == null || apiRes.Success == false || string.IsNullOrWhiteSpace(apiRes.RazonSocial))
            {
                return null;
            }

            return new ConsultaRucResultadoDto(
                Ruc: apiRes.Ruc ?? rucLimpio,
                RazonSocial: apiRes.RazonSocial.Trim(),
                Estado: apiRes.Estado?.Trim(),
                Condicion: apiRes.Condicion?.Trim(),
                Direccion: apiRes.Direccion?.Trim(),
                Departamento: apiRes.Departamento?.Trim(),
                Provincia: apiRes.Provincia?.Trim(),
                Distrito: apiRes.Distrito?.Trim()
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar RUC {Ruc} en ApisPeru", rucLimpio);
            throw;
        }
    }

    private class ApisPeruDniResponse
    {
        [JsonPropertyName("success")]
        public bool? Success { get; set; } = true;

        [JsonPropertyName("dni")]
        public string? Dni { get; set; }

        [JsonPropertyName("nombres")]
        public string? Nombres { get; set; }

        [JsonPropertyName("apellidoPaterno")]
        public string? ApellidoPaterno { get; set; }

        [JsonPropertyName("apellidoMaterno")]
        public string? ApellidoMaterno { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }

    private class ApisPeruRucResponse
    {
        [JsonPropertyName("success")]
        public bool? Success { get; set; } = true;

        [JsonPropertyName("ruc")]
        public string? Ruc { get; set; }

        [JsonPropertyName("razonSocial")]
        public string? RazonSocial { get; set; }

        [JsonPropertyName("estado")]
        public string? Estado { get; set; }

        [JsonPropertyName("condicion")]
        public string? Condicion { get; set; }

        [JsonPropertyName("direccion")]
        public string? Direccion { get; set; }

        [JsonPropertyName("departamento")]
        public string? Departamento { get; set; }

        [JsonPropertyName("provincia")]
        public string? Provincia { get; set; }

        [JsonPropertyName("distrito")]
        public string? Distrito { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }
}
