import { apiClient } from './apiClient';
import type { CajaEstado, AbrirCajaRequest } from '../types/caja';

export const cajaService = {
  obtenerEstadoCaja: (token: string): Promise<CajaEstado> =>
    apiClient.get<CajaEstado>('/api/caja/estado', token),

  abrirCaja: (data: AbrirCajaRequest, token: string): Promise<CajaEstado> =>
    apiClient.post<CajaEstado>('/api/caja/abrir', data, token),
};
