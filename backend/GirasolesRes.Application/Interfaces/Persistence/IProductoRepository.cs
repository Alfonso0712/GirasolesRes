using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IProductoRepository
{
    Task<Producto?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Producto?> ObtenerPorNombreNormalizadoAsync(string nombreNormalizado, TipoProducto tipo, CancellationToken cancellationToken = default);
    Task<bool> ExisteNombreAsync(string nombreNormalizado, TipoProducto tipo, Guid? excluirId = null, CancellationToken cancellationToken = default);
    Task<bool> TienePedidosAsync(Guid idProducto, CancellationToken cancellationToken = default);
    Task AgregarAsync(Producto producto, CancellationToken cancellationToken = default);
    Task ActualizarAsync(Producto producto, CancellationToken cancellationToken = default);
    Task<(List<Producto> Items, int Total)> ListarProductosAsync(
        string? busqueda,
        CategoriaProducto? categoria,
        TipoProducto? tipo,
        RolComponente? rol,
        bool? activo,
        int pagina,
        int tamano,
        CancellationToken cancellationToken = default);
    Task<List<Producto>> ListarDisponiblesAsync(
        CategoriaProducto? categoria,
        TipoProducto? tipo = null,
        RolComponente? rol = null,
        CancellationToken cancellationToken = default);
    Task<List<Producto>> ObtenerPorIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
