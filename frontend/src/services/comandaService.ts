import { apiClient } from './apiClient';
import type {
  ListarComandasResponse,
  ActualizarEstadoComandaResponse,
  DeshacerEstadoComandaResponse
} from '../types/comanda';

export const comandaService = {
  /**
   * CUS10.2: Consulta de comandas para cocina KDS
   */
  listarComandas: async (
    token: string,
    estado?: string
  ): Promise<ListarComandasResponse> => {
    const url = estado ? `/api/comandas?estado=${encodeURIComponent(estado)}` : '/api/comandas';
    return apiClient.get<ListarComandasResponse>(url, token);
  },

  /**
   * CUS10.3: Cambiar estado a 'enPreparacion' o 'lista'
   */
  actualizarEstado: async (
    id: string,
    estado: 'enPreparacion' | 'lista',
    token: string
  ): Promise<ActualizarEstadoComandaResponse> => {
    return apiClient.patch<ActualizarEstadoComandaResponse>(
      `/api/comandas/${id}/estado`,
      { estado },
      token
    );
  },

  /**
   * CUS10.3: Deshacer cambio de estado dentro de 10 segundos
   */
  deshacerEstado: async (
    id: string,
    token: string
  ): Promise<DeshacerEstadoComandaResponse> => {
    return apiClient.post<DeshacerEstadoComandaResponse>(
      `/api/comandas/${id}/deshacer`,
      {},
      token
    );
  }
};
