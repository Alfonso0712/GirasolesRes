import { apiClient } from './apiClient';
import type { ReporteVentasResponse, ReportePlatosResponse } from '../types/reporte';

export const reporteService = {
  obtenerReporteVentas(token: string, desde?: string, hasta?: string): Promise<ReporteVentasResponse> {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ReporteVentasResponse>(`/api/reportes/ventas${qs}`, token);
  },

  obtenerReportePlatos(token: string, desde?: string, hasta?: string, productoId?: string): Promise<ReportePlatosResponse> {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (productoId) params.append('productoId', productoId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ReportePlatosResponse>(`/api/reportes/platos${qs}`, token);
  },

  async descargarArchivo(
    token: string,
    tipo: 'ventas' | 'platos',
    formato: 'pdf' | 'csv',
    desde?: string,
    hasta?: string,
    productoId?: string
  ): Promise<void> {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (productoId && tipo === 'platos') params.append('productoId', productoId);
    params.append('formato', formato);

    const res = await fetch(`/api/reportes/${tipo}/exportar?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('No se pudo descargar el archivo.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${tipo === 'ventas' ? 'Ventas' : 'Platos'}_${desde || 'hoy'}_${hasta || 'hoy'}.${formato === 'pdf' ? 'pdf' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
