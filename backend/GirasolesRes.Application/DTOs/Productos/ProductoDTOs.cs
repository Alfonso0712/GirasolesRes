using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using GirasolesRes.Application.Common;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.DTOs.Productos;

public class CrearProductoRequest : IValidatableObject
{
    private static readonly Regex RegexNombreValido = new(
        @"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,\-\(\)]+$",
        RegexOptions.Compiled);

    [JsonPropertyName("nombre")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_51)]
    [StringLength(50, MinimumLength = 3, ErrorMessage = MensajesCatalogo.MSG_52)]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("tipo")]
    public string? Tipo { get; set; } = "Carta";

    [JsonPropertyName("categoria")]
    public string? Categoria { get; set; }

    [JsonPropertyName("rol")]
    public string? Rol { get; set; }

    [JsonPropertyName("precio")]
    public decimal? Precio { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var nombreTrim = Nombre?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(nombreTrim))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_51, new[] { nameof(Nombre) });
        }
        else if (nombreTrim.Length < 3 || nombreTrim.Length > 50 || !RegexNombreValido.IsMatch(nombreTrim))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_52, new[] { nameof(Nombre) });
        }

        var tipoStr = string.IsNullOrWhiteSpace(Tipo) ? "Carta" : Tipo;
        if (!TipoProductoExtensions.TryParseFlexible(tipoStr, out var tipoEnum))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_213, new[] { nameof(Tipo) });
        }
        else if (tipoEnum == TipoProducto.Carta)
        {
            if (string.IsNullOrWhiteSpace(Categoria) || !CategoriaProductoExtensions.TryParseFlexible(Categoria, out _))
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_54, new[] { nameof(Categoria) });
            }

            if (!Precio.HasValue || Precio.Value <= 0)
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_55, new[] { nameof(Precio) });
            }
            else if (Precio.Value > 999.99m || decimal.Round(Precio.Value, 2) != Precio.Value)
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_56, new[] { nameof(Precio) });
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(Rol) || !RolComponenteExtensions.TryParseFlexible(Rol, out _))
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_214, new[] { nameof(Rol) });
            }
        }
    }
}

public class ActualizarProductoRequest : IValidatableObject
{
    private static readonly Regex RegexNombreValido = new(
        @"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,\-\(\)]+$",
        RegexOptions.Compiled);

    [JsonPropertyName("nombre")]
    [Required(ErrorMessage = MensajesCatalogo.MSG_51)]
    [StringLength(50, MinimumLength = 3, ErrorMessage = MensajesCatalogo.MSG_52)]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("tipo")]
    public string? Tipo { get; set; } = "Carta";

    [JsonPropertyName("categoria")]
    public string? Categoria { get; set; }

    [JsonPropertyName("rol")]
    public string? Rol { get; set; }

    [JsonPropertyName("precio")]
    public decimal? Precio { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var nombreTrim = Nombre?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(nombreTrim))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_51, new[] { nameof(Nombre) });
        }
        else if (nombreTrim.Length < 3 || nombreTrim.Length > 50 || !RegexNombreValido.IsMatch(nombreTrim))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_52, new[] { nameof(Nombre) });
        }

        var tipoStr = string.IsNullOrWhiteSpace(Tipo) ? "Carta" : Tipo;
        if (!TipoProductoExtensions.TryParseFlexible(tipoStr, out var tipoEnum))
        {
            yield return new ValidationResult(MensajesCatalogo.MSG_213, new[] { nameof(Tipo) });
        }
        else if (tipoEnum == TipoProducto.Carta)
        {
            if (string.IsNullOrWhiteSpace(Categoria) || !CategoriaProductoExtensions.TryParseFlexible(Categoria, out _))
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_54, new[] { nameof(Categoria) });
            }

            if (!Precio.HasValue || Precio.Value <= 0)
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_55, new[] { nameof(Precio) });
            }
            else if (Precio.Value > 999.99m || decimal.Round(Precio.Value, 2) != Precio.Value)
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_56, new[] { nameof(Precio) });
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(Rol) || !RolComponenteExtensions.TryParseFlexible(Rol, out _))
            {
                yield return new ValidationResult(MensajesCatalogo.MSG_214, new[] { nameof(Rol) });
            }
        }
    }
}

public class CambiarEstadoProductoRequest
{
    public bool Activo { get; set; }
}

public class ProductoResponseDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = "Carta";
    public string? Rol { get; set; }
    public string? Categoria { get; set; }
    public decimal? Precio { get; set; }
    public bool Activo { get; set; }
}

public class PaginacionProductosResponse
{
    public List<ProductoResponseDto> Items { get; set; } = new();
    public int Total { get; set; }
}

public class CambiarEstadoProductoResponseDto
{
    public bool Activo { get; set; }
    public bool RetiradoDelMenu { get; set; }
}
