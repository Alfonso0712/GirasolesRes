import { apiClient } from './apiClient';
import type { MenuDiaResponseDto } from '../types/menuDia';

export type { PlatoMenuDto as PlatoMenuDiaDto, MenuDiaResponseDto } from '../types/menuDia';

export const menuDiaService = {
  obtenerMenuHoy: async (): Promise<MenuDiaResponseDto> => {
    return apiClient.get<MenuDiaResponseDto>('/menu-dia');
  },

  cambiarDisponibilidad: async (productoId: string, agotado: boolean): Promise<void> => {
    await apiClient.patch(`/menu-dia/hoy/platos/${productoId}/disponibilidad`, {
      agotado,
    });
  },
};
