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
  }
};
