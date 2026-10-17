import { apiClient } from './apiClient';
import type {
  MesaItem,
  CrearMesaData,
  ActualizarMesaData,
  ResumenMesas
} from '../types/mesa';

const BASE_URL = '/api/mesas';

export interface MesaMutationResponse {
  id: string;
  nombre: string;
  ocupacion: 'Libre' | 'Ocupada';
  activa: boolean;
  success?: boolean;
  message?: string;
}

export async function getMesasService(
  params: {
    estado?: string;
    incluirInactivas?: boolean;
  },
  token: string
): Promise<MesaItem[]> {
  const query = new URLSearchParams();
  if (params.estado && params.estado !== 'todas') {
    query.append('estado', params.estado);
  }
  if (params.incluirInactivas) {
    query.append('incluirInactivas', 'true');
  }

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
  return apiClient.get<MesaItem[]>(url, token);
}

export async function getResumenMesasService(token: string): Promise<ResumenMesas> {
  return apiClient.get<ResumenMesas>(`${BASE_URL}/resumen`, token);
}

export async function crearMesaService(
  data: CrearMesaData,
  token: string
): Promise<MesaMutationResponse> {
  return apiClient.post<MesaMutationResponse>(BASE_URL, data, token);
}

export async function actualizarMesaService(
  id: string,
  data: ActualizarMesaData,
  token: string
): Promise<MesaMutationResponse> {
  return apiClient.put<MesaMutationResponse>(`${BASE_URL}/${id}`, data, token);
}

export async function cambiarEstadoMesaService(
  id: string,
  activa: boolean,
  token: string
): Promise<MesaMutationResponse> {
  return apiClient.patch<MesaMutationResponse>(`${BASE_URL}/${id}/estado`, { activa }, token);
}
