import { apiClient } from './apiClient';
import type { ListarComandasResponse } from '../types/comanda';

export const comandaService = {
  listarComandas: async (estado?: string): Promise<ListarComandasResponse> => {
    const url = estado ? `/comandas?estado=${encodeURIComponent(estado)}` : '/comandas';
    return apiClient.get<ListarComandasResponse>(url);
  },

  actualizarEstado: async (id: string, estado: 'enPreparacion' | 'lista'): Promise<void> => {
    await apiClient.patch(`/comandas/${id}/estado`, { estado });
  },

  deshacerEstado: async (id: string): Promise<void> => {
    await apiClient.post(`/comandas/${id}/deshacer`);
  }
};
