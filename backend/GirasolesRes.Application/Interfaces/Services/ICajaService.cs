using GirasolesRes.Application.DTOs.Caja;

namespace GirasolesRes.Application.Interfaces.Services;

/// <summary>
/// Contrato unificado de servicio de aplicación para la gestión de caja (CUS 13),
/// segregado en operaciones transaccionales y consultas (ISP).
/// </summary>
public interface ICajaService : ICajaOperacionService, ICajaConsultaService
{
}
