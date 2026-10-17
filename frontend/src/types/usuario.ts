export type RolUsuario = 'Administrador' | 'Cajero' | 'Mozo' | 'Cocinero';

export interface UsuarioItem {
  id: string;
  nombre: string;
  usuario: string;
  correo?: string | null;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion: string;
}

export interface PaginacionUsuarios {
  items: UsuarioItem[];
  total: number;
}

export interface CrearUsuarioData {
  nombre: string;
  usuario: string;
  correo?: string;
  contrasena: string;
  rol: RolUsuario;
}

export interface ActualizarUsuarioData {
  nombre: string;
  usuario: string;
  correo?: string;
  rol: RolUsuario;
  contrasena?: string;
}
