import { apiClient } from './apiClient';
import type { MesaItem } from '../types/mesa';

export const mesaService = {
  getMesas: async (): Promise<MesaItem[]> => {
    return apiClient.get<MesaItem[]>('/mesas');
  }
};
