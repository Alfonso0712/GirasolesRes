import type {
  ListarVentasResponse,
  VentaDetalle,
  AnularVentaRequest,
  AnularVentaResponse,
  FiltroVentasParams
} from '../types/venta';
import { resolveApiUrl } from './apiClient';

const API_URL = resolveApiUrl('/api');

export const ventaService = {
  async listarVentas(params: FiltroVentasParams, token: string): Promise<ListarVentasResponse> {
    const query = new URLSearchParams();
    if (params.busqueda) query.append('busqueda', params.busqueda);
    if (params.desde) query.append('desde', params.desde);
    if (params.hasta) query.append('hasta', params.hasta);
    if (params.pagina) query.append('pagina', params.pagina.toString());
    if (params.tamano) query.append('tamano', params.tamano.toString());

    const res = await fetch(`${API_URL}/ventas?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const err = new Error(errData.message || 'Error al obtener la lista de ventas.');
      (err as any).status = res.status;
      throw err;
    }

    return res.json();
  },

  async obtenerDetalleVenta(ventaId: string, token: string): Promise<VentaDetalle> {
    const res = await fetch(`${API_URL}/ventas/${ventaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const err = new Error(errData.message || 'Error al obtener el detalle de la venta.');
      (err as any).status = res.status;
      throw err;
    }

    return res.json();
  },

  async anularVenta(ventaId: string, request: AnularVentaRequest, token: string): Promise<AnularVentaResponse> {
    const res = await fetch(`${API_URL}/ventas/${ventaId}/anular`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const err = new Error(errData.message || 'Error al anular la venta.');
      (err as any).status = res.status;
      (err as any).codigo = errData.codigo;
      throw err;
    }

    return res.json();
  },

  async descargarTicketTxt(ventaId: string, esCopia: boolean, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/ventas/${ventaId}/ticket?copia=${esCopia}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error al descargar el comprobante en PDF.');
    }

    const blob = await res.blob();
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
