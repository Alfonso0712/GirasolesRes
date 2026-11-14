import { apiClient } from './apiClient';
import type {
  CajaActualResponseDto,
  AbrirCajaRequestDto,
  CierreResumenDto,
  CerrarCajaRequestDto,
  ListarCierresResponseDto,
  CierreDetalleDto,
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
      montoCierreEfectivo: data.efectivoContado,
      efectivoEsperadoMostrado: data.efectivoEsperadoMostrado,
      montoCierreSistema: data.efectivoEsperadoMostrado,
      observacion: data.observacion,
      observaciones: data.observacion,
    };

    await apiClient.post('/caja/cerrar', payload);
  },

  obtenerHistorialCierres: async (params?: {
    desde?: string;
    hasta?: string;
    pagina?: number;
    tamano?: number;
  }): Promise<ListarCierresResponseDto> => {
    const query = new URLSearchParams();
    if (params?.desde) query.append('desde', params.desde);
    if (params?.hasta) query.append('hasta', params.hasta);
    if (params?.pagina) query.append('pagina', params.pagina.toString());
    if (params?.tamano) query.append('tamano', params.tamano.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';

    return apiClient.get<ListarCierresResponseDto>(`/caja/cierres${qs}`);
  },

  obtenerDetalleCierre: async (cajaId: string): Promise<CierreDetalleDto> => {
    return apiClient.get<CierreDetalleDto>(`/caja/cierres/${cajaId}`);
  },
};
