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
            .FirstOrDefaultAsync(u => u.Usu_Usuario.ToLower() == normalizado, cancellationToken);
    }

    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken cancellationToken = default)
    {
        var normalizado = correo.Trim().ToLowerInvariant();
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Usu_Correo != null && u.Usu_Correo.ToLower() == normalizado, cancellationToken);
    }

    public async Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id_Usuario == id, cancellationToken);
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
                EF.Functions.ILike(u.Usu_Nombre, $"%{b}%") ||
                EF.Functions.ILike(u.Usu_Usuario, $"%{b}%"));
        }

        // Filtro por Rol
        if (rol.HasValue)
        {
            query = query.Where(u => u.Usu_Rol == rol.Value);
        }

        // Filtro por Estado (Activo / Inactivo)
        if (activo.HasValue)
        {
            query = query.Where(u => u.Usu_Activo == activo.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        // Orden alfabético por nombre (Sección 1 y E-16)
        var items = await query
            .OrderBy(u => u.Usu_Nombre)
            .Skip((pagina - 1) * tamano)
            .Take(tamano)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<int> ContarAdministradoresActivosAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .CountAsync(u => u.Usu_Rol == RolUsuario.Administrador && u.Usu_Activo, cancellationToken);
    }

    public async Task<bool> ExisteNombreUsuarioAsync(string nombreUsuario, Guid? excluirId = null, CancellationToken cancellationToken = default)
    {
        var normalizado = nombreUsuario.Trim().ToLowerInvariant();
        var query = _context.Usuarios.Where(u => u.Usu_Usuario.ToLower() == normalizado);

        if (excluirId.HasValue)
        {
            query = query.Where(u => u.Id_Usuario != excluirId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExisteCorreoAsync(string correo, Guid? excluirId = null, CancellationToken cancellationToken = default)
    {
        var normalizado = correo.Trim().ToLowerInvariant();
        var query = _context.Usuarios.Where(u => u.Usu_Correo != null && u.Usu_Correo.ToLower() == normalizado);

        if (excluirId.HasValue)
        {
            query = query.Where(u => u.Id_Usuario != excluirId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> TieneMovimientosAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var tienePedidos = await _context.Pedidos.AnyAsync(p => p.Id_Usuario == usuarioId, cancellationToken);
        if (tienePedidos) return true;

        var tieneCajas = await _context.Cajas.AnyAsync(c => c.Id_Usuario == usuarioId || c.Id_UsuarioCierre == usuarioId, cancellationToken);
        if (tieneCajas) return true;

        var tieneVentas = await _context.Ventas.AnyAsync(v => v.Id_Usuario == usuarioId, cancellationToken);
        if (tieneVentas) return true;

        return false;
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
