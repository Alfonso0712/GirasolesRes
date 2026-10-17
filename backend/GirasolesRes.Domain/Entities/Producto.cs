using System.Globalization;
using System.Text;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Producto
{
    public Guid Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public string NombreNormalizado { get; private set; } = string.Empty;
    public CategoriaProducto Categoria { get; private set; }
    public decimal Precio { get; private set; }
    public bool Activo { get; private set; }
    public DateTime FechaCreacionUtc { get; private set; }
    public DateTime? FechaActualizacionUtc { get; private set; }

    // Constructor privado para EF Core
    private Producto() { }

    public Producto(
        string nombre,
        CategoriaProducto categoria,
        decimal precio,
        bool activo = true)
    {
        Id = Guid.NewGuid();
        Nombre = nombre.Trim();
        NombreNormalizado = NormalizarTexto(nombre);
        Categoria = categoria;
        Precio = decimal.Round(precio, 2);
        Activo = activo;
        FechaCreacionUtc = DateTime.UtcNow;
    }

    public void Actualizar(string nombre, CategoriaProducto categoria, decimal precio)
    {
        Nombre = nombre.Trim();
        NombreNormalizado = NormalizarTexto(nombre);
        Categoria = categoria;
        Precio = decimal.Round(precio, 2);
        FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void CambiarEstado(bool activo)
    {
        Activo = activo;
        FechaActualizacionUtc = DateTime.UtcNow;
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
