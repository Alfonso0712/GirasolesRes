import { apiClient } from './apiClient';
import type {
  MenuDiaResponse,
  CandidatoMenu,
  GuardarMenuDiaRequest,
  CambiarDisponibilidadRequest,
  CambiarDisponibilidadResponse
} from '../types/menuDia';

export const menuDiaService = {
  /**
   * Obtener el menú del día de hoy (hora de Lima).
   * Accesible para Administrador, Cocinero, Mozo y Cajero.
   */
  obtenerMenuHoy: async (token: string): Promise<MenuDiaResponse> => {
    return apiClient.get<MenuDiaResponse>('/api/menu-dia', token);
  },

  /**
   * Obtener productos activos para armar el menú del día.
   * Accesible para Administrador.
   */
  obtenerCandidatos: async (token: string): Promise<CandidatoMenu[]> => {
    return apiClient.get<CandidatoMenu[]>('/api/menu-dia/candidatos', token);
  },

  /**
   * Guardar o actualizar la definición del menú de hoy.
   * Exclusivo para Administrador.
   */
  guardarMenuHoy: async (
    data: GuardarMenuDiaRequest,
    token: string
  ): Promise<{ success: boolean; message: string; data: MenuDiaResponse }> => {
    return apiClient.put<{ success: boolean; message: string; data: MenuDiaResponse }>(
      '/api/menu-dia/hoy',
      data,
      token
    );
  },

  /**
   * Cambiar la disponibilidad de un plato (Disponible / Agotado).
   * Accesible para Administrador y Cocinero.
   */
  cambiarDisponibilidad: async (
    productoId: string,
    data: CambiarDisponibilidadRequest,
    token: string
  ): Promise<{ success: boolean; message: string; data: CambiarDisponibilidadResponse }> => {
    return apiClient.patch<{ success: boolean; message: string; data: CambiarDisponibilidadResponse }>(
      `/api/menu-dia/hoy/platos/${productoId}/disponibilidad`,
      data,
      token
    );
  }
};
