import type { UserSession } from '../types/auth';

const BASE_URL = '/api/auth';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  detail?: string;
}

/**
 * Servicio centralizado para comunicación con la API de autenticación (Semanas 05 y 07).
 * Aísla completamente la lógica HTTP de los componentes visuales.
 */
export async function loginService(usuario: string, contrasena: string): Promise<UserSession> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, contrasena }),
  });

  const body: ApiResponse<UserSession> = await response.json().catch(() => ({
    success: false,
    message: 'Error de comunicación con el servidor.',
  }));

  if (!response.ok || !body.success) {
    const error: any = new Error(body.message || 'Error al iniciar sesión');
    error.status = response.status;
    error.errors = body.errors;
    error.detail = body.detail;
    throw error;
  }

  return body.data!;
}

export async function forgotPasswordService(correo: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo }),
  });

  const body: ApiResponse<string> = await response.json().catch(() => ({
    success: false,
    message: 'No se pudo conectar con el servidor.',
  }));

  if (!response.ok || !body.success) {
    const error: any = new Error(body.message || 'Error al procesar la solicitud');
    error.status = response.status;
    throw error;
  }

  return body.message;
}

export async function resetPasswordService(
  correo: string,
  codigo: string,
  nuevaContrasena: string
): Promise<string> {
  const response = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, codigo, nuevaContrasena }),
  });

  const body: ApiResponse<string> = await response.json().catch(() => ({
    success: false,
    message: 'No se pudo conectar con el servidor.',
  }));

  if (!response.ok || !body.success) {
    const error: any = new Error(body.message || 'Error al actualizar la contraseña');
    error.status = response.status;
    throw error;
  }

  return body.message;
}

export async function logoutService(motivo: string, token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ motivo })
  }).catch(() => {
    // Error de red
    const err: any = new Error('No se pudo cerrar la sesión en el servidor, pero se cerró en este equipo.'); // MSG-50
    err.status = 0;
    throw err;
  });

  if (!response.ok && response.status !== 204) {
    const err: any = new Error('No se pudo cerrar la sesión en el servidor, pero se cerró en este equipo.'); // MSG-50
    err.status = response.status;
    throw err;
  }
}

export async function renovarTokenService(token: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/renovar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.token) {
    const err: any = new Error(body.message || 'Sesión vencida.');
    err.status = response.status;
    throw err;
  }

  return body.token;
}

export async function cambiarContrasenaPropiaService(
  contrasenaActual: string,
  nuevaContrasena: string,
  token: string
): Promise<{ token: string; message: string }> {
  const response = await fetch('/api/perfil/contrasena', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ contrasenaActual, nuevaContrasena })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    const err: any = new Error(body.message || 'No se pudo completar la operación. Intente nuevamente.');
    err.status = response.status;
    err.field = body.field;
    err.errors = body.errors;
    throw err;
  }

  return { token: body.token, message: body.message };
}

