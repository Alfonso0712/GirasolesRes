import { apiClient } from './apiClient';
import type {
  CajaActualResponseDto,
  AbrirCajaRequestDto,
  CierreResumenDto,
  CerrarCajaRequestDto,
  HistorialCierresItemDto
} from '../types/caja';

export const cajaService = {
  obtenerActual: async (): Promise<CajaActualResponseDto> => {
    return apiClient.get<CajaActualResponseDto>('/caja/actual');
  },

  obtenerEstadoActual: async (): Promise<CajaActualResponseDto> => {
    return cajaService.obtenerActual();
  },

  abrirCaja: async (montoInicial: number, observaciones?: string): Promise<void> => {
    const solicitudId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-${Date.now()}`;

    const payload: AbrirCajaRequestDto = {
      solicitudId,
      montoInicial,
      montoApertura: montoInicial,
      observaciones,
    };

    try {
      await apiClient.post('/caja/abrir', payload);
    } catch (err: unknown) {
      // Fallback a /caja/apertura si el proxy o backend usa esa ruta
      try {
        await apiClient.post('/caja/apertura', payload);
      } catch {
        throw err;
      }
    }
  },

  obtenerResumenCierre: async (): Promise<CierreResumenDto> => {
    return apiClient.get<CierreResumenDto>('/caja/cierre/resumen');
  },

  cerrarCaja: async (data: {
    efectivoContado: number;
    efectivoEsperadoMostrado: number;
    observacion?: string;
  }): Promise<void> => {
    const solicitudId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-${Date.now()}`;

    const payload: CerrarCajaRequestDto = {
      solicitudId,
      efectivoContado: data.efectivoContado,
      montoCierreEfectivo: data.efectivoContado,
      efectivoEsperadoMostrado: data.efectivoEsperadoMostrado,
      montoCierreSistema: data.efectivoEsperadoMostrado,
      observacion: data.observacion,
      observaciones: data.observacion,
    };

    try {
      await apiClient.post('/caja/cerrar', payload);
    } catch (err: unknown) {
      // Fallback a /caja/cierre si el proxy o backend usa esa ruta
      try {
        await apiClient.post('/caja/cierre', payload);
      } catch {
        throw err;
      }
    }
  },

  obtenerHistorialCierres: async (): Promise<{ items: HistorialCierresItemDto[] }> => {
    try {
      return await apiClient.get<{ items: HistorialCierresItemDto[] }>('/caja/cierres');
    } catch (err: unknown) {
      try {
        return await apiClient.get<{ items: HistorialCierresItemDto[] }>('/caja/historial');
      } catch {
        throw err;
      }
    }
  }
};
