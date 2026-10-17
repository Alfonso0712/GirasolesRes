using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface IMenuDiaRepository
{
    Task<MenuDia?> ObtenerPorFechaAsync(DateOnly fecha, CancellationToken cancellationToken = default);
    Task<MenuDia?> ObtenerMenuHoyConDetalleAsync(CancellationToken cancellationToken = default);
    Task<bool> ExisteMenuHoyAsync(CancellationToken cancellationToken = default);
    Task AgregarAsync(MenuDia menuDia, CancellationToken cancellationToken = default);
    Task ActualizarAsync(MenuDia menuDia, CancellationToken cancellationToken = default);
    Task RemoverProductoDeMenuVigenteAsync(Guid productoId, string usuario, CancellationToken cancellationToken = default);
}
