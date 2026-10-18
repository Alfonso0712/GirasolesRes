using GirasolesRes.Application.DTOs.Comandas;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IComandaService
{
    Task<ListarComandasResponseDto> ListarComandasAsync(string? estados = null);
    Task<ActualizarEstadoComandaResponse> ActualizarEstadoAsync(Guid idComanda, ActualizarEstadoComandaRequest request, string nombreUsuario);
    Task<DeshacerEstadoComandaResponse> DeshacerEstadoAsync(Guid idComanda, string nombreUsuario);
}
