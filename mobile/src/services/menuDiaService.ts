import { apiClient } from './apiClient';

export interface PlatoMenuDiaDto {
  productoId: string;
  nombre: string;
  categoria: string;
  agotado: boolean;
}

export interface MenuDiaResponseDto {
  menuId?: string;
  fecha?: string;
  platos: PlatoMenuDiaDto[];
}

export const menuDiaService = {
  obtenerMenuHoy: async (): Promise<MenuDiaResponseDto> => {
    try {
      return await apiClient.get<MenuDiaResponseDto>('/menu-dia');
    } catch {
      return await apiClient.get<MenuDiaResponseDto>('/menudia/hoy');
    }
  },

  cambiarDisponibilidad: async (productoId: string, agotado: boolean): Promise<void> => {
    try {
      await apiClient.patch(`/menu-dia/hoy/platos/${productoId}/disponibilidad`, {
        agotado,
      });
    } catch {
      await apiClient.patch(`/menudia/platos/${productoId}/disponibilidad`, {
        agotado,
      });
    }
  },
};
