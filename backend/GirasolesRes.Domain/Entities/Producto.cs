using System.Globalization;
using System.Text;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Domain.Entities;

public class Producto
{
    public Guid Id_Producto { get; private set; }
    public string Pro_Nombre { get; private set; } = string.Empty;
    public string Pro_NombreNormalizado { get; private set; } = string.Empty;
    public TipoProducto Pro_Tipo { get; private set; } = TipoProducto.Carta;
    public RolComponente? Pro_Rol { get; private set; }
    public CategoriaProducto? Pro_Categoria { get; private set; }
    public decimal? Pro_Precio { get; private set; }
    public bool Pro_Activo { get; private set; }
    public DateTime Pro_FechaCreacionUtc { get; private set; }
    public DateTime? Pro_FechaActualizacionUtc { get; private set; }

    // Constructor privado para EF Core
    private Producto() { }

    /// <summary>
    /// Constructor para producto de carta tradicional (con categoría y precio).
    /// </summary>
    public Producto(
        string proNombre,
        CategoriaProducto proCategoria,
        decimal proPrecio,
        bool proActivo = true)
    {
        Id_Producto = Guid.NewGuid();
        Pro_Nombre = proNombre.Trim();
        Pro_NombreNormalizado = NormalizarTexto(proNombre);
        Pro_Tipo = TipoProducto.Carta;
        Pro_Rol = null;
        Pro_Categoria = proCategoria;
        Pro_Precio = decimal.Round(proPrecio, 2);
        Pro_Activo = proActivo;
        Pro_FechaCreacionUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Constructor para componente de menú (con rol y sin precio independiente).
    /// </summary>
    public Producto(
        string proNombre,
        RolComponente proRol,
        bool proActivo = true)
    {
        Id_Producto = Guid.NewGuid();
        Pro_Nombre = proNombre.Trim();
        Pro_NombreNormalizado = NormalizarTexto(proNombre);
        Pro_Tipo = TipoProducto.Componente;
        Pro_Rol = proRol;
        Pro_Categoria = null;
        Pro_Precio = null;
        Pro_Activo = proActivo;
        Pro_FechaCreacionUtc = DateTime.UtcNow;
    }

    /// <summary>
    /// Constructor general parametrizado.
    /// </summary>
    public Producto(
        string proNombre,
        TipoProducto proTipo,
        CategoriaProducto? proCategoria,
        RolComponente? proRol,
        decimal? proPrecio,
        bool proActivo = true)
    {
        Id_Producto = Guid.NewGuid();
        Pro_Nombre = proNombre.Trim();
        Pro_NombreNormalizado = NormalizarTexto(proNombre);
        Pro_Tipo = proTipo;
        Pro_Activo = proActivo;
        Pro_FechaCreacionUtc = DateTime.UtcNow;

        if (proTipo == TipoProducto.Carta)
        {
            Pro_Categoria = proCategoria ?? CategoriaProducto.Otro;
            Pro_Precio = proPrecio.HasValue ? decimal.Round(proPrecio.Value, 2) : 0m;
            Pro_Rol = null;
        }
        else
        {
            Pro_Rol = proRol ?? RolComponente.Segundo;
            Pro_Categoria = null;
            Pro_Precio = null;
        }
    }

    public void Actualizar(string proNombre, CategoriaProducto proCategoria, decimal proPrecio)
    {
        Pro_Nombre = proNombre.Trim();
        Pro_NombreNormalizado = NormalizarTexto(proNombre);
        Pro_Tipo = TipoProducto.Carta;
        Pro_Rol = null;
        Pro_Categoria = proCategoria;
        Pro_Precio = decimal.Round(proPrecio, 2);
        Pro_FechaActualizacionUtc = DateTime.UtcNow;
    }

    public void Actualizar(
        string proNombre,
        TipoProducto proTipo,
        CategoriaProducto? proCategoria,
        RolComponente? proRol,
        decimal? proPrecio)
    {
        Pro_Nombre = proNombre.Trim();
        Pro_NombreNormalizado = NormalizarTexto(proNombre);
        Pro_Tipo = proTipo;

        if (proTipo == TipoProducto.Carta)
        {
            Pro_Categoria = proCategoria ?? CategoriaProducto.Otro;
            Pro_Precio = proPrecio.HasValue ? decimal.Round(proPrecio.Value, 2) : 0m;
            Pro_Rol = null;
        }
        else
        {
            Pro_Rol = proRol ?? RolComponente.Segundo;
            Pro_Categoria = null;
            Pro_Precio = null;
        }

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
    public static string NormalizarTexto(string texto) => Common.StringNormalizer.NormalizarParaBusqueda(texto);
}
