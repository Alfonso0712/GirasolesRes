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

  obtenerReportePlatos: async (desde?: string, hasta?: string): Promise<ReportePlatosResponse> => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ReportePlatosResponse>(`/reportes/platos${qs}`);
  }
};
