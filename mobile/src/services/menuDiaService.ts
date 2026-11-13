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
    return apiClient.get<MenuDiaResponseDto>('/menu-dia');
  },

  cambiarDisponibilidad: async (productoId: string, agotado: boolean): Promise<void> => {
    await apiClient.patch(`/menu-dia/hoy/platos/${productoId}/disponibilidad`, {
      agotado,
    });
  },
};
