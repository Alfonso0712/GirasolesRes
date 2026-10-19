using GirasolesRes.Application.DTOs.Consultas;

namespace GirasolesRes.Application.Interfaces.Services;

public interface IConsultaDocumentoService
{
    Task<ConsultaDniResultadoDto?> ConsultarDniAsync(string dni, CancellationToken ct = default);
    Task<ConsultaRucResultadoDto?> ConsultarRucAsync(string ruc, CancellationToken ct = default);
}
