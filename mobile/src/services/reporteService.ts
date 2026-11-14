import { apiClient } from './apiClient';
import type { ReporteVentasResponse, ReportePlatosResponse } from '../types/reporte';

export const reporteService = {
  obtenerReporteVentas: async (desde?: string, hasta?: string): Promise<ReporteVentasResponse> => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ReporteVentasResponse>(`/reportes/ventas${qs}`);
  },

  obtenerReportePlatos: async (
    desde?: string,
    hasta?: string,
    productoId?: string
  ): Promise<ReportePlatosResponse> => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (productoId) params.append('productoId', productoId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ReportePlatosResponse>(`/reportes/platos${qs}`);
  },

  descargarReporteVentasPdf: async (desde?: string, hasta?: string): Promise<Blob> => {
    return apiClient.descargarArchivo('/reportes/ventas/exportar', {
      desde,
      hasta,
      formato: 'pdf',
    });
  },

  descargarReportePlatosPdf: async (
    desde?: string,
    hasta?: string,
    productoId?: string
  ): Promise<Blob> => {
    return apiClient.descargarArchivo('/reportes/platos/exportar', {
      desde,
      hasta,
      productoId,
      formato: 'pdf',
    });
  },
};
