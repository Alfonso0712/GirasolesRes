export type RolUsuario = 'Administrador' | 'Mozo' | 'Cocinero' | 'Cajero';

export interface UserSession {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: RolUsuario;
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: UserSession;
}
