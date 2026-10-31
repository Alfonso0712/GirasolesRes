import { apiClient } from './apiClient';
import type {
  PedidoPendienteCobro,
  CobroRequest,
  CobroResponse,
  ComprobanteDetalle,
  ResultadoConsultaDni,
  ResultadoConsultaRuc,
} from '../types/cobro';

export const cobroService = {
  obtenerPedidosPendientes: (token: string): Promise<PedidoPendienteCobro[]> =>
    apiClient.get<PedidoPendienteCobro[]>('/api/cobros/pendientes', token),

  procesarCobro: (data: CobroRequest, token: string): Promise<CobroResponse> =>
    apiClient.post<CobroResponse>('/api/cobros', data, token),

  obtenerComprobante: (
    ventaId: string,
    copia: boolean = false,
    token: string
  ): Promise<ComprobanteDetalle> =>
    apiClient.get<ComprobanteDetalle>(
      `/api/cobros/comprobantes/${ventaId}?copia=${copia}`,
      token
    ),

  descargarComprobantePdf: async (
    ventaId: string,
    copia: boolean = false,
    token: string
  ): Promise<void> => {
    const blob = await apiClient.getBlob(
      `/api/cobros/comprobantes/${ventaId}/pdf?copia=${copia}`,
      token
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comprobante_${ventaId.substring(0, 8)}_${copia ? 'COPIA' : 'ORIGINAL'}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Alias retrocompatible
  descargarComprobanteTxt: async (
    ventaId: string,
    copia: boolean = false,
    token: string
  ): Promise<void> => {
    return cobroService.descargarComprobantePdf(ventaId, copia, token);
  },

  consultarDni: (dni: string, token: string): Promise<ResultadoConsultaDni> =>
    apiClient.get<ResultadoConsultaDni>(`/api/consultas/dni/${dni}`, token),

  consultarRuc: (ruc: string, token: string): Promise<ResultadoConsultaRuc> =>
    apiClient.get<ResultadoConsultaRuc>(`/api/consultas/ruc/${ruc}`, token),
};
