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

  crearMesa: async (data: CrearMesaData): Promise<MesaMutationResponse> => {
    return apiClient.post<MesaMutationResponse>('/mesas', data);
  },

  actualizarMesa: async (id: string, data: ActualizarMesaData): Promise<MesaMutationResponse> => {
    return apiClient.put<MesaMutationResponse>(`/mesas/${id}`, data);
  },

  cambiarEstadoMesa: async (id: string, activa: boolean): Promise<MesaMutationResponse> => {
    return apiClient.patch<MesaMutationResponse>(`/mesas/${id}/estado`, { activa });
  }
};
