import { apiClient } from './apiClient';
import type {
  MesaItem,
  CrearMesaData,
  ActualizarMesaData,
  MesaMutationResponse
} from '../types/mesa';

export const mesaService = {
  getMesas: async (params?: { estado?: string; incluirInactivas?: boolean }): Promise<MesaItem[]> => {
    const query = new URLSearchParams();
    if (params?.estado && params.estado !== 'todas') {
      query.append('estado', params.estado);
    }
    if (params?.incluirInactivas) {
      query.append('incluirInactivas', 'true');
    }
    const qStr = query.toString();
    const url = qStr ? `/mesas?${qStr}` : '/mesas';
    return apiClient.get<MesaItem[]>(url);
  },

  crearMesa: async (datosMesa: CrearMesaData): Promise<MesaMutationResponse> => {
    return apiClient.post<MesaMutationResponse>('/mesas', datosMesa);
  },

  actualizarMesa: async (id: string, datosMesa: ActualizarMesaData): Promise<MesaMutationResponse> => {
    return apiClient.put<MesaMutationResponse>(`/mesas/${id}`, datosMesa);
  },

  cambiarEstadoMesa: async (id: string, estaActiva: boolean): Promise<MesaMutationResponse> => {
    return apiClient.patch<MesaMutationResponse>(`/mesas/${id}/estado`, { activa: estaActiva });
  }
};
