using GirasolesRes.Domain.Entities;
using GirasolesRes.Domain.Enums;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorNombreUsuarioAsync(string nombreUsuario, CancellationToken cancellationToken = default);
    Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken cancellationToken = default);
    Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default);
    Task ActualizarAsync(Usuario usuario, CancellationToken cancellationToken = default);
    Task EliminarAsync(Usuario usuario, CancellationToken cancellationToken = default);
    Task<(List<Usuario> Items, int Total)> ListarUsuariosAsync(
        string? busqueda, 
        RolUsuario? rol, 
        bool? activo, 
        int pagina, 
        int tamano, 
        CancellationToken cancellationToken = default);
    Task<int> ContarAdministradoresActivosAsync(CancellationToken cancellationToken = default);
    Task<bool> ExisteNombreUsuarioAsync(string nombreUsuario, Guid? excluirId = null, CancellationToken cancellationToken = default);
    Task<bool> ExisteCorreoAsync(string correo, Guid? excluirId = null, CancellationToken cancellationToken = default);
    Task<bool> TieneMovimientosAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
