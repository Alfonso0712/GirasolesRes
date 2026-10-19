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

  descargarComprobanteTxt: async (
    ventaId: string,
    copia: boolean = false,
    token: string
  ): Promise<void> => {
    const response = await fetch(
      `/api/cobros/comprobantes/${ventaId}/pdf?copia=${copia}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al descargar el ticket de cobro.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ticket_${ventaId.substring(0, 8)}_${copia ? 'COPIA' : 'ORIGINAL'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  consultarDni: (dni: string, token: string): Promise<ResultadoConsultaDni> =>
    apiClient.get<ResultadoConsultaDni>(`/api/consultas/dni/${dni}`, token),

  consultarRuc: (ruc: string, token: string): Promise<ResultadoConsultaRuc> =>
    apiClient.get<ResultadoConsultaRuc>(`/api/consultas/ruc/${ruc}`, token),
};
