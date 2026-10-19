import { apiClient } from './apiClient';
import type {
  MenuCompletoItem,
  ActualizarPrecioMenuCompletoData,
  CambiarEstadoMenuCompletoData
} from '../types/menuCompleto';

const BASE_URL = '/api/menus-completos';

export async function getMenusCompletosService(
  soloActivos?: boolean,
  token?: string
): Promise<MenuCompletoItem[]> {
  const params = new URLSearchParams();
  if (soloActivos !== undefined) {
    params.append('soloActivos', soloActivos ? 'true' : 'false');
  }
  const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
  return apiClient.get<MenuCompletoItem[]>(url, token);
}

export async function getMenuCompletoPorIdService(
  id: number,
  token?: string
): Promise<MenuCompletoItem> {
  return apiClient.get<MenuCompletoItem>(`${BASE_URL}/${id}`, token);
}

export async function actualizarPrecioMenuCompletoService(
  id: number,
  data: ActualizarPrecioMenuCompletoData,
  token?: string
): Promise<MenuCompletoItem> {
  return apiClient.put<MenuCompletoItem>(`${BASE_URL}/${id}`, data, token);
}

export async function cambiarEstadoMenuCompletoService(
  id: number,
  data: CambiarEstadoMenuCompletoData,
  token?: string
): Promise<MenuCompletoItem> {
  return apiClient.patch<MenuCompletoItem>(`${BASE_URL}/${id}/estado`, data, token);
}
