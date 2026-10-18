import { apiClient } from './apiClient';
import type { InicioDashboardData, BloqueResultado } from '../types/inicio';

export const inicioService = {
  obtenerInicio(token: string): Promise<InicioDashboardData> {
    return apiClient.get<InicioDashboardData>('/api/inicio', token);
  },

  obtenerBloque<T>(bloque: string, token: string): Promise<BloqueResultado<T>> {
    return apiClient.get<BloqueResultado<T>>(`/api/inicio/${bloque}`, token);
  }
};
