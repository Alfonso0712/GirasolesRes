using GirasolesRes.Application.DTOs.Pedidos;

namespace GirasolesRes.Application.Interfaces.Services;

/// <summary>
/// Contrato unificado de servicio de pedidos que hereda la segregación de comandos, consultas y avisos (ISP).
/// </summary>
public interface IPedidoService : IPedidoComandoService, IPedidoConsultaService, IAvisoComandaService
{
}
