import { apiClient } from './apiClient';
import type { AvisoComandaDto } from '../types/pedido';

export const avisoService = {
  obtenerAvisosPendientes: async (): Promise<AvisoComandaDto[]> => {
    return apiClient.get<AvisoComandaDto[]>('/avisos');
  },

  marcarAvisoVisto: async (id: string): Promise<void> => {
    await apiClient.post(`/avisos/${id}/visto`);
  },
};
