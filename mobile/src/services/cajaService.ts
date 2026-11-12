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

  abrirCaja: async (montoInicial: number): Promise<void> => {
    const solicitudId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-${Date.now()}`;
    const payload: AbrirCajaRequestDto = {
      solicitudId,
      montoInicial,
    };
    await apiClient.post('/caja/abrir', payload);
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
      efectivoEsperadoMostrado: data.efectivoEsperadoMostrado,
      observacion: data.observacion,
    };
    await apiClient.post('/caja/cerrar', payload);
  },

  obtenerHistorialCierres: async (): Promise<{ items: HistorialCierresItemDto[] }> => {
    return apiClient.get<{ items: HistorialCierresItemDto[] }>('/caja/cierres');
  }
};
