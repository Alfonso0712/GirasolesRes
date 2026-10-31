import type {
  ListarVentasResponse,
  VentaDetalle,
  AnularVentaRequest,
  AnularVentaResponse,
  FiltroVentasParams
} from '../types/venta';
import { apiClient } from './apiClient';

export const ventaService = {
  async listarVentas(params: FiltroVentasParams, token: string): Promise<ListarVentasResponse> {
    const query = new URLSearchParams();
    if (params.busqueda) query.append('busqueda', params.busqueda);
    if (params.desde) query.append('desde', params.desde);
    if (params.hasta) query.append('hasta', params.hasta);
    if (params.pagina) query.append('pagina', params.pagina.toString());
    if (params.tamano) query.append('tamano', params.tamano.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';

    return apiClient.get<ListarVentasResponse>(`/api/ventas${qs}`, token);
  },

  async obtenerDetalleVenta(ventaId: string, token: string): Promise<VentaDetalle> {
    return apiClient.get<VentaDetalle>(`/api/ventas/${ventaId}`, token);
  },

  async anularVenta(ventaId: string, request: AnularVentaRequest, token: string): Promise<AnularVentaResponse> {
    return apiClient.post<AnularVentaResponse>(`/api/ventas/${ventaId}/anular`, request, token);
  },

  async descargarTicketTxt(ventaId: string, esCopia: boolean, token: string): Promise<void> {
    const blob = await apiClient.getBlob(`/api/ventas/${ventaId}/ticket?copia=${esCopia}`, token);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comprobante_${ventaId.substring(0, 8)}_${esCopia ? 'COPIA' : 'ORIGINAL'}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async descargarTicketPdf(ventaId: string, esCopia: boolean, token: string): Promise<void> {
    return this.descargarTicketTxt(ventaId, esCopia, token);
  }
};
