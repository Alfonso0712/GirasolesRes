import { apiClient } from './apiClient';
import type {
  ProductoItem,
  RegistrarPedidoMesaRequest,
  RegistrarPedidoLlevarRequest,
  RegistrarPedidoResultDto
} from '../types/pedido';

export const pedidoService = {
  obtenerCatalogo: async (): Promise<ProductoItem[]> => {
    try {
      return await apiClient.get<ProductoItem[]>('/productos?soloDisponibles=true');
    } catch {
      return await apiClient.get<ProductoItem[]>('/productos');
    }
  },

  registrarPedidoMesa: async (
    request: RegistrarPedidoMesaRequest
  ): Promise<RegistrarPedidoResultDto> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-mesa-${Date.now()}`);

    const payload = {
      solicitudId,
      mesaId: request.mesaId,
      lineas: request.lineas,
      notas: request.notas,
    };

    return apiClient.post<RegistrarPedidoResultDto>('/pedidos/mesa', payload);
  },

  registrarPedidoLlevar: async (
    request: RegistrarPedidoLlevarRequest
  ): Promise<RegistrarPedidoResultDto> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-llevar-${Date.now()}`);

    const payload = {
      solicitudId,
      referencia: request.referencia || 'Cliente Mostrador',
      lineas: request.lineas,
    };

    return apiClient.post<RegistrarPedidoResultDto>('/pedidos/llevar', payload);
  }
};
