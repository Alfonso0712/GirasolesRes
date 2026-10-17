import { apiClient } from './apiClient';
import type { UserSession } from '../types/auth';

const BASE_URL = '/api/auth';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  detail?: string;
  field?: string;
}

/**
 * Servicio centralizado para comunicación con la API de autenticación (Semanas 05 y 07).
 * Aísla completamente la lógica HTTP de los componentes visuales mediante apiClient.
 */
export async function loginService(usuario: string, contrasena: string): Promise<UserSession> {
  const body = await apiClient.post<ApiResponse<UserSession>>(`${BASE_URL}/login`, { usuario, contrasena });
  return body.data!;
}

export async function forgotPasswordService(correo: string): Promise<string> {
  const body = await apiClient.post<ApiResponse<string>>(`${BASE_URL}/forgot-password`, { correo });
  return body.message;
}

export async function resetPasswordService(
  correo: string,
  codigo: string,
  nuevaContrasena: string
): Promise<string> {
  const body = await apiClient.post<ApiResponse<string>>(`${BASE_URL}/reset-password`, {
    correo,
    codigo,
    nuevaContrasena,
  });
  return body.message;
}

export async function logoutService(motivo: string, token: string): Promise<void> {
  try {
    await apiClient.post(`${BASE_URL}/logout`, { motivo }, token);
  } catch (err: any) {
    const error: any = new Error('No se pudo cerrar la sesión en el servidor, pero se cerró en este equipo.'); // MSG-50
    error.status = err?.status || 0;
    throw error;
  }
}

export async function renovarTokenService(token: string): Promise<string> {
  const body = await apiClient.post<{ token: string; message?: string }>(
    `${BASE_URL}/renovar`,
    {},
    token
  );
  return body.token;
}

export async function cambiarContrasenaPropiaService(
  contrasenaActual: string,
  nuevaContrasena: string,
  token: string
): Promise<{ token: string; message: string }> {
  const body = await apiClient.put<{ token: string; message: string }>(
    '/api/perfil/contrasena',
    { contrasenaActual, nuevaContrasena },
    token
  );
  return { token: body.token, message: body.message };
}
