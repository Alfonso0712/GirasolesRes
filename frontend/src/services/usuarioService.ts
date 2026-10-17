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

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
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
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const defaultMsg = response.status === 401
      ? 'Su sesión expiró. Ingrese nuevamente.'
      : 'No se pudo cargar la lista de usuarios. Intente nuevamente.';
    const err: any = new Error(errorBody.message || defaultMsg);
    err.status = response.status;
    throw err;
  }

  const data: PaginacionUsuarios = await response.json();
  return data;
}

export async function getUsuarioByIdService(id: string, token: string): Promise<UsuarioItem> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(token)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const defaultMsg = response.status === 401
      ? 'Su sesión expiró. Ingrese nuevamente.'
      : 'Usuario no encontrado.';
    const err: any = new Error(errorBody.message || defaultMsg);
    err.status = response.status;
    throw err;
  }

  return await response.json();
}

export async function crearUsuarioService(data: CrearUsuarioData, token: string): Promise<{ user: UsuarioItem; message: string }> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    const defaultMsg = response.status === 401
      ? 'Su sesión expiró. Ingrese nuevamente.'
      : 'No se pudo completar la operación. Intente nuevamente.';
    const err: any = new Error(body.message || defaultMsg);
    err.status = response.status;
    err.errors = body.errors;
    throw err;
  }

  return { user: body.data, message: body.message };
}

export async function actualizarUsuarioService(
  id: string,
  data: ActualizarUsuarioData,
  token: string
): Promise<{ user: UsuarioItem; message: string }> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    const defaultMsg = response.status === 401
      ? 'Su sesión expiró. Ingrese nuevamente.'
      : 'No se pudo completar la operación. Intente nuevamente.';
    const err: any = new Error(body.message || defaultMsg);
    err.status = response.status;
    err.errors = body.errors;
    throw err;
  }

  return { user: body.data, message: body.message };
}

export async function cambiarEstadoUsuarioService(
  id: string,
  activo: boolean,
  token: string
): Promise<{ user: UsuarioItem; message: string }> {
  const response = await fetch(`${BASE_URL}/${id}/estado`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ activo })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    const defaultMsg = response.status === 401
      ? 'Su sesión expiró. Ingrese nuevamente.'
      : 'No se pudo completar la operación. Intente nuevamente.';
    const err: any = new Error(body.message || defaultMsg);
    err.status = response.status;
    throw err;
  }

  return { user: body.data, message: body.message };
}

export async function eliminarUsuarioService(id: string, token: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || (body.success !== undefined && !body.success)) {
    const defaultMsg = response.status === 401
      ? 'Su sesión expiró. Ingrese nuevamente.'
      : 'No se pudo completar la operación. Intente nuevamente.';
    const err: any = new Error(body.message || defaultMsg);
    err.status = response.status;
    throw err;
  }

  return body.message || 'Usuario eliminado correctamente.';
}
