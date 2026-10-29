import type { Theme } from '../hooks/useTheme';
import type { Handedness } from '../hooks/useHandedness';

export type { Theme, Handedness };
export type RolUsuario = 'Administrador' | 'Cajero' | 'Mozo' | 'Cocinero';

export interface UserSession {
  token: string;
  rol: RolUsuario;
  nombre: string;
  usuario: string;
  tema?: Theme;
  orientacion?: Handedness;
}

export interface LoginErrorResponse {
  mensaje?: string;
  errores?: Record<string, string>;
}
