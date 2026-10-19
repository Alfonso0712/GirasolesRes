using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class ProductoRepository : IProductoRepository
{
    private readonly GirasolesDbContext _context;

    public ProductoRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<Producto?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Productos
            .FirstOrDefaultAsync(p => p.Id_Producto == id, cancellationToken);
    }

    public async Task<Producto?> ObtenerPorNombreNormalizadoAsync(string nombreNormalizado, TipoProducto tipo, CancellationToken cancellationToken = default)
    {
        var norm = nombreNormalizado.Trim().ToLowerInvariant();
        return await _context.Productos
            .FirstOrDefaultAsync(p => p.Pro_NombreNormalizado == norm && p.Pro_Tipo == tipo, cancellationToken);
    }

    public async Task<bool> ExisteNombreAsync(string nombreNormalizado, TipoProducto tipo, Guid? excluirId = null, CancellationToken cancellationToken = default)
    {
        var norm = nombreNormalizado.Trim().ToLowerInvariant();
        return await _context.Productos
            .AnyAsync(p => p.Pro_NombreNormalizado == norm && p.Pro_Tipo == tipo && (!excluirId.HasValue || p.Id_Producto != excluirId.Value), cancellationToken);
    }

    public async Task<bool> TienePedidosAsync(Guid idProducto, CancellationToken cancellationToken = default)
    {
        return await _context.DetallesPedido
            .AnyAsync(d => d.Id_Producto == idProducto, cancellationToken);
    }

    public async Task AgregarAsync(Producto producto, CancellationToken cancellationToken = default)
    {
        await _context.Productos.AddAsync(producto, cancellationToken);
    }

    public Task ActualizarAsync(Producto producto, CancellationToken cancellationToken = default)
    {
        _context.Productos.Update(producto);
        return Task.CompletedTask;
    }

    public async Task<(List<Producto> Items, int Total)> ListarProductosAsync(
        string? busqueda,
        CategoriaProducto? categoria,
        TipoProducto? tipo,
        RolComponente? rol,
        bool? activo,
        int pagina,
        int tamano,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Productos.AsQueryable();

        // Filtro por búsqueda (máx. 50 caracteres, sin distinguir mayúsculas ni tildes - RV-40 / RF-11)
        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var busquedaNormalizada = Producto.NormalizarTexto(busqueda);
            query = query.Where(p => p.Pro_NombreNormalizado.Contains(busquedaNormalizada));
        }

        // Filtro por tipo de producto (Carta vs Componente)
        if (tipo.HasValue)
        {
            query = query.Where(p => p.Pro_Tipo == tipo.Value);
        }

        // Filtro por rol de componente
        if (rol.HasValue)
        {
            query = query.Where(p => p.Pro_Rol == rol.Value);
        }

        // Filtro por categoría (RF-11)
        if (categoria.HasValue)
        {
            query = query.Where(p => p.Pro_Categoria == categoria.Value);
        }

        // Filtro por estado activo/inactivo (RF-11)
        if (activo.HasValue)
        {
            query = query.Where(p => p.Pro_Activo == activo.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        // Orden por tipo, categoría, rol y luego por nombre
        var items = await query
            .OrderBy(p => p.Pro_Tipo)
            .ThenBy(p => p.Pro_Categoria)
            .ThenBy(p => p.Pro_Rol)
            .ThenBy(p => p.Pro_Nombre)
            .Skip((pagina - 1) * tamano)
            .Take(tamano)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<List<Producto>> ListarDisponiblesAsync(
        CategoriaProducto? categoria,
        TipoProducto? tipo = null,
        RolComponente? rol = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Productos.Where(p => p.Pro_Activo);

        if (tipo.HasValue)
        {
            query = query.Where(p => p.Pro_Tipo == tipo.Value);
        }

        if (rol.HasValue)
        {
            query = query.Where(p => p.Pro_Rol == rol.Value);
        }

        if (categoria.HasValue)
        {
            query = query.Where(p => p.Pro_Categoria == categoria.Value);
        }

        return await query
            .OrderBy(p => p.Pro_Tipo)
            .ThenBy(p => p.Pro_Categoria)
            .ThenBy(p => p.Pro_Rol)
            .ThenBy(p => p.Pro_Nombre)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Producto>> ObtenerPorIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var idSet = ids.Distinct().ToList();
        return await _context.Productos
            .Where(p => idSet.Contains(p.Id_Producto))
            .ToListAsync(cancellationToken);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
