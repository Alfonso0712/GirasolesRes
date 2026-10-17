import { apiClient } from './apiClient';
import type {
  UsuarioItem,
  PaginacionUsuarios,
  CrearUsuarioData,
  ActualizarUsuarioData
} from '../types/usuario';

const BASE_URL = '/api/usuarios';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  detail?: string;
}

export async function getUsuariosService(
  params: {
    busqueda?: string;
    rol?: string;
    estado?: boolean | null;
    pagina?: number;
    tamano?: number;
  },
  token: string
): Promise<PaginacionUsuarios> {
  const query = new URLSearchParams();
  if (params.busqueda) query.append('busqueda', params.busqueda);
  if (params.rol && params.rol !== 'Todos') query.append('rol', params.rol);
  if (params.estado !== undefined && params.estado !== null) query.append('estado', String(params.estado));
  if (params.pagina) query.append('pagina', String(params.pagina));
  if (params.tamano) query.append('tamano', String(params.tamano));

  const url = `${BASE_URL}?${query.toString()}`;
  return apiClient.get<PaginacionUsuarios>(url, token);
}

export async function getUsuarioByIdService(id: string, token: string): Promise<UsuarioItem> {
  return apiClient.get<UsuarioItem>(`${BASE_URL}/${id}`, token);
}

export async function crearUsuarioService(
  data: CrearUsuarioData,
  token: string
): Promise<{ user: UsuarioItem; message: string }> {
  const body = await apiClient.post<ApiResponse<UsuarioItem>>(BASE_URL, data, token);
  return { user: body.data!, message: body.message };
}

export async function actualizarUsuarioService(
  id: string,
  data: ActualizarUsuarioData,
  token: string
): Promise<{ user: UsuarioItem; message: string }> {
  const body = await apiClient.put<ApiResponse<UsuarioItem>>(`${BASE_URL}/${id}`, data, token);
  return { user: body.data!, message: body.message };
}

export async function cambiarEstadoUsuarioService(
  id: string,
  activo: boolean,
  token: string
): Promise<{ user: UsuarioItem; message: string }> {
  const body = await apiClient.patch<ApiResponse<UsuarioItem>>(`${BASE_URL}/${id}/estado`, { activo }, token);
  return { user: body.data!, message: body.message };
}

export async function eliminarUsuarioService(id: string, token: string): Promise<string> {
  const body = await apiClient.delete<ApiResponse<any>>(`${BASE_URL}/${id}`, token);
  return body.message || 'Usuario eliminado correctamente.';
}
