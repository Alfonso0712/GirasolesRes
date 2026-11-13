import { apiClient } from './apiClient';
import type { InicioDashboardData, BloqueResultado } from '../types/inicio';

export const inicioService = {
  obtenerInicio: async (): Promise<InicioDashboardData> => {
    return apiClient.get<InicioDashboardData>('/inicio');
  },

  obtenerBloque: async <T>(bloque: string): Promise<BloqueResultado<T>> => {
    return apiClient.get<BloqueResultado<T>>(`/inicio/${bloque}`);
  },
};
