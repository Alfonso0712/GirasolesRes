import { apiClient } from './apiClient';
import type { PedidoPendienteCobro, CobroRequest, CobroResponse } from '../types/cobro';

export const cobroService = {
  obtenerPedidosPendientes: async (): Promise<PedidoPendienteCobro[]> => {
    return apiClient.get<PedidoPendienteCobro[]>('/cobros/pendientes');
  },

  procesarCobro: async (data: CobroRequest): Promise<CobroResponse> => {
    return apiClient.post<CobroResponse>('/cobros', data);
  }
};
