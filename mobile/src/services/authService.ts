import { apiClient } from './apiClient';
import type { UserSession, LoginResponse } from '../types/auth';

export const authService = {
  login: async (usuario: string, contrasena: string): Promise<UserSession> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', { usuario, contrasena });
    if (res.data?.token) {
      localStorage.setItem('GIRASOLES_TOKEN', res.data.token);
      localStorage.setItem('GIRASOLES_SESSION', JSON.stringify(res.data));
    }
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', { motivo: 'Cierre de sesión móvil' });
    } catch {
      // Ignorar error de cierre en backend si no hay red
    } finally {
      localStorage.removeItem('GIRASOLES_TOKEN');
      localStorage.removeItem('GIRASOLES_SESSION');
    }
  },

  renovarToken: async (): Promise<string> => {
    const res = await apiClient.post<{ token: string; message?: string }>('/auth/renovar', {});
    const nuevoToken = res.token;
    if (nuevoToken) {
      localStorage.setItem('GIRASOLES_TOKEN', nuevoToken);
      const session = authService.getStoredSession();
      if (session) {
        session.token = nuevoToken;
        localStorage.setItem('GIRASOLES_SESSION', JSON.stringify(session));
      }
      return nuevoToken;
    }
    throw new Error('Respuesta de renovación sin token');
  },

  getStoredSession: (): UserSession | null => {
    const raw = localStorage.getItem('GIRASOLES_SESSION');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }
};
