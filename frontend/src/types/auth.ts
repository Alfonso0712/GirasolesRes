export type RolUsuario = 'Administrador' | 'Cajero' | 'Mozo' | 'Cocinero';

export interface UserSession {
  token: string;
  rol: RolUsuario;
  nombre: string;
  usuario: string;
}

export interface LoginErrorResponse {
  mensaje?: string;
  errores?: Record<string, string>;
}
