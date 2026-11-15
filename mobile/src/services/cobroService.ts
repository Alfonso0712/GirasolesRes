import { apiClient } from './apiClient';
import type {
  PedidoPendienteCobro,
  CobroRequest,
  CobroResponse,
  ResultadoConsultaDni,
  ResultadoConsultaRuc,
} from '../types/cobro';

export const cobroService = {
  obtenerPedidosPendientes: async (): Promise<PedidoPendienteCobro[]> => {
    return apiClient.get<PedidoPendienteCobro[]>('/cobros/pendientes');
  },

  procesarCobro: async (datosCobro: CobroRequest): Promise<CobroResponse> => {
    return apiClient.post<CobroResponse>('/cobros', datosCobro);
  },

  consultarDni: async (dni: string): Promise<ResultadoConsultaDni> => {
    return apiClient.get<ResultadoConsultaDni>(`/consultas/dni/${dni}`);
  },

  consultarRuc: async (ruc: string): Promise<ResultadoConsultaRuc> => {
    return apiClient.get<ResultadoConsultaRuc>(`/consultas/ruc/${ruc}`);
  },
};
