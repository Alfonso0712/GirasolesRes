import { apiClient } from './apiClient';
import type {
  RegistrarPedidoMesaRequest,
  RegistrarPedidoResultDto,
  RegistrarPedidoLlevarRequest,
  RegistrarPedidoLlevarResultDto,
  AgregarLineasPedidoRequest,
  AgregarLineasResultDto,
  PedidoResponseDto,
  ProductoMenuPedido
} from '../types/pedido';

export const pedidoService = {
  /**
   * CUS07.1: Registra el pedido de una mesa libre
   */
  registrarPedidoMesa: async (
    request: RegistrarPedidoMesaRequest,
    token: string
  ): Promise<RegistrarPedidoResultDto> => {
    return apiClient.post<RegistrarPedidoResultDto>('/api/pedidos/mesa', request, token);
  },

  /**
   * CUS08: Registra un pedido para llevar
   */
  registrarPedidoLlevar: async (
    request: RegistrarPedidoLlevarRequest,
    token: string
  ): Promise<RegistrarPedidoLlevarResultDto> => {
    return apiClient.post<RegistrarPedidoLlevarResultDto>('/api/pedidos/llevar', request, token);
  },

  /**
   * CUS07.2: Agrega productos adicionales a un pedido existente
   */
  agregarLineas: async (
    pedidoId: string,
    request: AgregarLineasPedidoRequest,
    token: string
  ): Promise<AgregarLineasResultDto> => {
    return apiClient.post<AgregarLineasResultDto>(`/api/pedidos/${pedidoId}/lineas`, request, token);
  },

  /**
   * Obtiene el detalle de un pedido por ID
   */
  obtenerPedidoPorId: async (
    pedidoId: string,
    token: string
  ): Promise<PedidoResponseDto> => {
    return apiClient.get<PedidoResponseDto>(`/api/pedidos/${pedidoId}`, token);
  },

  /**
   * Obtiene el pedido activo de una mesa
   */
  obtenerPedidoActivoPorMesa: async (
    mesaId: string,
    token: string
  ): Promise<PedidoResponseDto | null> => {
    try {
      return await apiClient.get<PedidoResponseDto>(`/api/pedidos/mesa/${mesaId}/activo`, token);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  /**
   * Obtiene los productos disponibles para tomar pedidos (menú del día o productos activos)
   */
  obtenerCatalogoPedido: async (
    token: string
  ): Promise<ProductoMenuPedido[]> => {
    return apiClient.get<ProductoMenuPedido[]>('/api/pedidos/catalogo-pedido', token);
  },

  /**
   * CUS09.1: Listar pedidos del día con filtros y resumen de contadores
   */
  listarPedidos: async (
    filtros: import('../types/pedido').ListarPedidosFiltros,
    token: string
  ): Promise<import('../types/pedido').ListarPedidosResponseDto> => {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.mesaId) params.append('mesaId', filtros.mesaId);
    if (filtros.soloMios) params.append('soloMios', 'true');
    if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros.tamano) params.append('tamano', filtros.tamano.toString());

    const qs = params.toString();
    return apiClient.get<import('../types/pedido').ListarPedidosResponseDto>(
      `/api/pedidos${qs ? `?${qs}` : ''}`,
      token
    );
  },

  /**
   * CUS09.1: Consulta el detalle completo de un pedido por ID
   */
  obtenerDetalleCompleto: async (
    pedidoId: string,
    token: string
  ): Promise<import('../types/pedido').DetallePedidoCompletoDto> => {
    return apiClient.get<import('../types/pedido').DetallePedidoCompletoDto>(`/api/pedidos/${pedidoId}`, token);
  },

  /**
   * CUS09.2: Modificar pedido
   */
  modificarPedido: async (
    pedidoId: string,
    request: import('../types/pedido').ModificarPedidoRequest,
    token: string
  ): Promise<{ total: number }> => {
    return apiClient.put<{ total: number }>(`/api/pedidos/${pedidoId}`, request, token);
  },

  /**
   * CUS09.2: Anular pedido con motivo
   */
  anularPedido: async (
    pedidoId: string,
    request: import('../types/pedido').AnularPedidoRequest,
    token: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(`/api/pedidos/${pedidoId}/anular`, request, token);
  },

  /**
   * CUS09.3: Consulta los avisos de comanda lista pendientes
   */
  obtenerAvisosPendientes: async (
    token: string
  ): Promise<import('../types/pedido').AvisoComandaDto[]> => {
    return apiClient.get<import('../types/pedido').AvisoComandaDto[]>('/api/avisos', token);
  },

  /**
   * CUS09.3: Marca un aviso como visto
   */
  marcarAvisoVisto: async (
    comandaId: string,
    token: string
  ): Promise<void> => {
    return apiClient.post<void>(`/api/avisos/${comandaId}/visto`, {}, token);
  }
};

