export interface MenuCompletoParteItem {
  id: number;
  nombre: string;
  orden: number;
  rolesPermitidos: string[];
}

export interface MenuCompletoItem {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
  incluye?: string;
  partes: MenuCompletoParteItem[];
}

export interface ActualizarPrecioMenuCompletoData {
  precio: number;
}

export interface CambiarEstadoMenuCompletoData {
  activo: boolean;
}
