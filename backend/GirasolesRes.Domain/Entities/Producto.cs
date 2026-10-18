using System.Globalization;
using System.Text;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Producto
{
    public Guid Id_Producto { get; private set; }
    public string Pro_Nombre { get; private set; } = string.Empty;
    public string Pro_NombreNormalizado { get; private set; } = string.Empty;
    public CategoriaProducto Pro_Categoria { get; private set; }
    public decimal Pro_Precio { get; private set; }
    public bool Pro_Activo { get; private set; }
    public DateTime Pro_FechaCreacionUtc { get; private set; }
    public DateTime? Pro_FechaActualizacionUtc { get; private set; }

    // Constructor privado para EF Core
    private Producto() { }

    public Producto(
        string proNombre,
        CategoriaProducto proCategoria,
        decimal proPrecio,
        bool proActivo = true)
    {
        Id_Producto = Guid.NewGuid();
        Pro_Nombre = proNombre.Trim();
        Pro_NombreNormalizado = NormalizarTexto(proNombre);
        Pro_Categoria = proCategoria;
        Pro_Precio = decimal.Round(proPrecio, 2);
        Pro_Activo = proActivo;
        Pro_FechaCreacionUtc = DateTime.UtcNow;
    }

    public void Actualizar(string proNombre, CategoriaProducto proCategoria, decimal proPrecio)
    {
        Pro_Nombre = proNombre.Trim();
        Pro_NombreNormalizado = NormalizarTexto(proNombre);
        Pro_Categoria = proCategoria;
        Pro_Precio = decimal.Round(proPrecio, 2);
        Pro_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarEstado(bool proActivo)
    {
        Pro_Activo = proActivo;
        Pro_FechaActualizacionUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Normaliza el nombre eliminando tildes, signos diacríticos, recortando espacios y convirtiendo a minúsculas (RV-34 / RV-37).
    /// </summary>
    public static string NormalizarTexto(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            return string.Empty;

        var normalizedString = texto.Trim().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        return sb.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
    }
}
