import { apiClient } from './apiClient';

export interface CambiarContrasenaPropiaRequest {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

export interface CambiarContrasenaResponse {
  success: boolean;
  message: string;
  token?: string;
}

export const perfilService = {
  actualizarTema: async (tema: 'light' | 'dark'): Promise<void> => {
    try {
      await apiClient.patch('/perfil/tema', { tema });
    } catch {
      // Ignorar fallas si está desconectado o el servidor no responde
    }
  },

  actualizarOrientacion: async (orientacion: 'right' | 'left'): Promise<void> => {
    try {
      await apiClient.patch('/perfil/orientacion', { orientacion });
    } catch {
      // Ignorar fallas si está desconectado o el servidor no responde
    }
  },

  cambiarContrasena: async (data: CambiarContrasenaPropiaRequest): Promise<CambiarContrasenaResponse> => {
    const res = await apiClient.put<CambiarContrasenaResponse>('/perfil/contrasena', data);
    if (res.token) {
      try {
        localStorage.setItem('GIRASOLES_TOKEN', res.token);
        const rawSession = localStorage.getItem('GIRASOLES_SESSION');
        if (rawSession) {
          const sessionObj = JSON.parse(rawSession) as Record<string, unknown>;
          sessionObj.token = res.token;
          localStorage.setItem('GIRASOLES_SESSION', JSON.stringify(sessionObj));
        }
      } catch {
        // Ignorar error de almacenamiento
      }
    }
    return res;
  },
};