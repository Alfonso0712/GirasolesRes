import { apiClient } from './apiClient';
import type { MenuDiaResponse } from '../types/menuDia';

export interface ProductoCartaPublica {
  id: string;
  nombre: string;
  tipo: 'Carta' | 'Componente';
  rol?: string | null;
  categoria?: string | null;
  precio?: number | null;
  activo: boolean;
}

export const landingService = {
  /**
   * Obtiene la carta completa en tiempo real desde la API pública.
   */
  obtenerCartaPublica: async (categoria?: string): Promise<ProductoCartaPublica[]> => {
    const url = categoria && categoria !== 'Todas'
      ? `/api/productos/carta-publica?categoria=${encodeURIComponent(categoria)}`
      : '/api/productos/carta-publica';
    return apiClient.get<ProductoCartaPublica[]>(url);
  },

  /**
   * Obtiene el menú del día actual con sus platos y estado de disponibilidad.
   */
  obtenerMenuPublico: async (): Promise<MenuDiaResponse> => {
    return apiClient.get<MenuDiaResponse>('/api/menu-dia/publico');
  }
};
