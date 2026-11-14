import { apiClient } from './apiClient';
import type {
  ListarComandasResponse,
  ActualizarEstadoComandaResponse,
  DeshacerEstadoComandaResponse,
} from '../types/comanda';

export const comandaService = {
  listarComandas: async (estado?: string): Promise<ListarComandasResponse> => {
    const url = estado ? `/comandas?estado=${encodeURIComponent(estado)}` : '/comandas';
    return apiClient.get<ListarComandasResponse>(url);
  },

  actualizarEstado: async (
    id: string,
    estado: 'enPreparacion' | 'lista'
  ): Promise<ActualizarEstadoComandaResponse> => {
    return apiClient.patch<ActualizarEstadoComandaResponse>(`/comandas/${id}/estado`, { estado });
  },

  deshacerEstado: async (id: string): Promise<DeshacerEstadoComandaResponse> => {
    return apiClient.post<DeshacerEstadoComandaResponse>(`/comandas/${id}/deshacer`);
  },
};
