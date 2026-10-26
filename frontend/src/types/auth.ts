import type { Theme } from '../hooks/useTheme';

export type { Theme };
export type RolUsuario = 'Administrador' | 'Cajero' | 'Mozo' | 'Cocinero';

export interface UserSession {
  token: string;
  rol: RolUsuario;
  nombre: string;
  usuario: string;
  tema?: Theme;
}

export interface LoginErrorResponse {
  mensaje?: string;
  errores?: Record<string, string>;
}
