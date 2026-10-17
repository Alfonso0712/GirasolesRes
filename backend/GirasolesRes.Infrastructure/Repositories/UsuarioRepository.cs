using GirasolesRes.Application.Interfaces.Persistence;
using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;
using GirasolesRes.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GirasolesRes.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly GirasolesDbContext _context;

    public UsuarioRepository(GirasolesDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> ObtenerPorNombreUsuarioAsync(string nombreUsuario, CancellationToken cancellationToken = default)
    {
        var normalizado = nombreUsuario.Trim().ToLowerInvariant();
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.NombreUsuario.ToLower() == normalizado, cancellationToken);
    }

    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken cancellationToken = default)
    {
        var normalizado = correo.Trim().ToLowerInvariant();
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo != null && u.Correo.ToLower() == normalizado, cancellationToken);
    }

    public async Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        await _context.Usuarios.AddAsync(usuario, cancellationToken);
    }

    public Task ActualizarAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        _context.Usuarios.Update(usuario);
        return Task.CompletedTask;
    }

    public Task EliminarAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        _context.Usuarios.Remove(usuario);
        return Task.CompletedTask;
    }

    public async Task<(List<Usuario> Items, int Total)> ListarUsuariosAsync(
        string? busqueda,
        RolUsuario? rol,
        bool? activo,
        int pagina,
        int tamano,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Usuarios.AsQueryable();

        // Filtro por búsqueda (nombre o usuario) - RV-22
        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var b = busqueda.Trim().ToLower();
            query = query.Where(u =>
                EF.Functions.ILike(u.NombreCompleto, $"%{b}%") ||
                EF.Functions.ILike(u.NombreUsuario, $"%{b}%"));
        }

        // Filtro por Rol
        if (rol.HasValue)
        {
            query = query.Where(u => u.Rol == rol.Value);
        }

        // Filtro por Estado (Activo / Inactivo)
        if (activo.HasValue)
        {
            query = query.Where(u => u.Activo == activo.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        // Orden alfabético por nombre (Sección 1 y E-16)
        var items = await query
            .OrderBy(u => u.NombreCompleto)
            .Skip((pagina - 1) * tamano)
            .Take(tamano)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<int> ContarAdministradoresActivosAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .CountAsync(u => u.Rol == RolUsuario.Administrador && u.Activo, cancellationToken);
    }

    public async Task<bool> ExisteNombreUsuarioAsync(string nombreUsuario, Guid? excluirId = null, CancellationToken cancellationToken = default)
    {
        var normalizado = nombreUsuario.Trim().ToLowerInvariant();
        var query = _context.Usuarios.Where(u => u.NombreUsuario.ToLower() == normalizado);

        if (excluirId.HasValue)
        {
            query = query.Where(u => u.Id != excluirId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExisteCorreoAsync(string correo, Guid? excluirId = null, CancellationToken cancellationToken = default)
    {
        var normalizado = correo.Trim().ToLowerInvariant();
        var query = _context.Usuarios.Where(u => u.Correo != null && u.Correo.ToLower() == normalizado);

        if (excluirId.HasValue)
        {
            query = query.Where(u => u.Id != excluirId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public Task<bool> TieneMovimientosAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        // Sección 12.3 Observación 3:
        // Los módulos de ventas, pedidos y caja aún no existen.
        // Se implementa la verificación devolviendo false (sin movimientos) para permitir eliminación si no hay registros.
        // El historial de ingresos y auditoría no cuentan como movimientos según Sección 1.
        return Task.FromResult(false);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
