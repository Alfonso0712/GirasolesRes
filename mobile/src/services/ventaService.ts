import { apiClient } from './apiClient';
import type { ListarVentasResponse, FiltroVentasParams } from '../types/venta';

export const ventaService = {
  listarVentas: async (params?: FiltroVentasParams): Promise<ListarVentasResponse> => {
    const query = new URLSearchParams();
    if (params?.busqueda) query.append('busqueda', params.busqueda);
    if (params?.desde) query.append('desde', params.desde);
    if (params?.hasta) query.append('hasta', params.hasta);
    if (params?.tipoComprobante) query.append('tipoComprobante', params.tipoComprobante);
    if (params?.pagina) query.append('pagina', params.pagina.toString());
    if (params?.tamano) query.append('tamano', params.tamano.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';

    return apiClient.get<ListarVentasResponse>(`/ventas${qs}`);
  },
};
