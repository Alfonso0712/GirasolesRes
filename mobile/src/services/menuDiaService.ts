import { apiClient } from './apiClient';
import type {
  MenuDiaResponseDto,
  CandidatoMenuDto,
  GuardarMenuDiaRequest,
  GuardarMenuDiaResponseDto,
} from '../types/menuDia';

export type {
  PlatoMenuDto as PlatoMenuDiaDto,
  MenuDiaResponseDto,
  CandidatoMenuDto,
  GuardarMenuDiaRequest,
  GuardarMenuDiaResponseDto,
} from '../types/menuDia';

let cacheMenuHoy: MenuDiaResponseDto | null = null;
let cacheTimestamp = 0;
let promesaEnVuelo: Promise<MenuDiaResponseDto> | null = null;
const CACHE_TTL_MS = 15000;

function notificarActualizacionMenu(nuevoMenu?: MenuDiaResponseDto | null): void {
  if (nuevoMenu !== undefined) {
    cacheMenuHoy = nuevoMenu;
    cacheTimestamp = nuevoMenu ? Date.now() : 0;
  } else {
    cacheMenuHoy = null;
    cacheTimestamp = 0;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('girasoles:menu-dia-actualizado', { detail: cacheMenuHoy }));
    window.dispatchEvent(new CustomEvent('girasoles:reload-active-view'));
  }
}

export const menuDiaService = {
  obtenerMenuHoy: async (opciones?: { usarCache?: boolean }): Promise<MenuDiaResponseDto> => {
    if (
      opciones?.usarCache &&
      cacheMenuHoy &&
      Date.now() - cacheTimestamp < CACHE_TTL_MS
    ) {
      return cacheMenuHoy;
    }

    if (promesaEnVuelo) {
      return promesaEnVuelo;
    }

    promesaEnVuelo = apiClient
      .get<MenuDiaResponseDto>('/menu-dia')
      .then((res) => {
        cacheMenuHoy = res;
        cacheTimestamp = Date.now();
        return res;
      })
      .finally(() => {
        promesaEnVuelo = null;
      });

    return promesaEnVuelo;
  },

  obtenerMenuHoyCacheado: (): MenuDiaResponseDto | null => {
    return cacheMenuHoy;
  },

  invalidarCache: (): void => {
    notificarActualizacionMenu(null);
  },

  obtenerCandidatos: async (): Promise<CandidatoMenuDto[]> => {
    return apiClient.get<CandidatoMenuDto[]>('/menu-dia/candidatos');
  },

  guardarMenuHoy: async (
    data: GuardarMenuDiaRequest
  ): Promise<GuardarMenuDiaResponseDto> => {
    const res = await apiClient.put<GuardarMenuDiaResponseDto>('/menu-dia/hoy', data);
    notificarActualizacionMenu(res?.data ?? null);
    return res;
  },

  cambiarDisponibilidad: async (productoId: string, agotado: boolean): Promise<void> => {
    await apiClient.patch(`/menu-dia/hoy/platos/${productoId}/disponibilidad`, {
      agotado,
    });
    notificarActualizacionMenu(null);
  },
};
