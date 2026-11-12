import { apiClient } from './apiClient';
import type {
  ProductoItem,
  RegistrarPedidoMesaRequest,
  RegistrarPedidoResultDto
} from '../types/pedido';

export const pedidoService = {
  obtenerCatalogo: async (): Promise<ProductoItem[]> => {
    // Intenta obtener productos disponibles
    try {
      return await apiClient.get<ProductoItem[]>('/productos?soloDisponibles=true');
    } catch {
      // Fallback a menú del día o lista general si el endpoint varía
      return await apiClient.get<ProductoItem[]>('/productos');
    }
  },

  registrarPedidoMesa: async (
    request: RegistrarPedidoMesaRequest
  ): Promise<RegistrarPedidoResultDto> => {
    return apiClient.post<RegistrarPedidoResultDto>('/pedidos/mesa', request);
  }
};
