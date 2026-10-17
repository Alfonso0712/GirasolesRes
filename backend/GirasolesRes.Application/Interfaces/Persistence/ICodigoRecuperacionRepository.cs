using GirasolesRes.Domain.Entities;

namespace GirasolesRes.Application.Interfaces.Persistence;

public interface ICodigoRecuperacionRepository
{
    Task InvalidarCodigosActivosPorCorreoAsync(string correo, CancellationToken cancellationToken = default);
    Task<CodigoRecuperacion?> ObtenerUltimoValidoAsync(string correo, CancellationToken cancellationToken = default);
    Task AgregarAsync(CodigoRecuperacion codigo, CancellationToken cancellationToken = default);
    Task ActualizarAsync(CodigoRecuperacion codigo, CancellationToken cancellationToken = default);
    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
