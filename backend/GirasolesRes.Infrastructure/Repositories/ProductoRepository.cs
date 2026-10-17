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
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Producto?> ObtenerPorNombreNormalizadoAsync(string nombreNormalizado, CancellationToken cancellationToken = default)
    {
        var norm = nombreNormalizado.Trim().ToLowerInvariant();
        return await _context.Productos
            .FirstOrDefaultAsync(p => p.NombreNormalizado == norm, cancellationToken);
    }

    public async Task<bool> ExisteNombreAsync(string nombreNormalizado, Guid? excluirId = null, CancellationToken cancellationToken = default)
    {
        var norm = nombreNormalizado.Trim().ToLowerInvariant();
        return await _context.Productos
            .AnyAsync(p => p.NombreNormalizado == norm && (!excluirId.HasValue || p.Id != excluirId.Value), cancellationToken);
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
            query = query.Where(p => p.NombreNormalizado.Contains(busquedaNormalizada));
        }

        // Filtro por categoría (RF-11)
        if (categoria.HasValue)
        {
            query = query.Where(p => p.Categoria == categoria.Value);
        }

        // Filtro por estado activo/inactivo (RF-11)
        if (activo.HasValue)
        {
            query = query.Where(p => p.Activo == activo.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        // Orden por categoría y luego por nombre; 10 por página (RF-11 / RNF-11)
        var items = await query
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nombre)
            .Skip((pagina - 1) * tamano)
            .Take(tamano)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<List<Producto>> ListarDisponiblesAsync(CategoriaProducto? categoria, CancellationToken cancellationToken = default)
    {
        var query = _context.Productos.Where(p => p.Activo);

        if (categoria.HasValue)
        {
            query = query.Where(p => p.Categoria == categoria.Value);
        }

        return await query
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nombre)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Producto>> ObtenerPorIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var idSet = ids.Distinct().ToList();
        return await _context.Productos
            .Where(p => idSet.Contains(p.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
