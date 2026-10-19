export interface DesayunoMenu {
  id: string;
  nombre: string;
}

export interface PlatoMenu {
  productoId: string;
  nombre: string;
  categoria: string;
  precio: number;
  agotado: boolean;
}

export interface OpcionMenu {
  productoId: string;
  nombre: string;
  rol: string;
  agotado: boolean;
}

export interface OpcionParteDia {
  productoId: string;
  nombre: string;
  agotado: boolean;
}

export interface MenuCompletoParteDia {
  id: number;
  nombre: string;
  orden: number;
  rolesPermitidos: string[];
  opciones: OpcionParteDia[];
}

export interface MenuCompletoDia {
  id: number;
  nombre: string;
  precio: number;
  incluye: string | null;
  disponible: boolean;
  motivoNoDisponible?: string | null;
  partes: MenuCompletoParteDia[];
}

export interface MenuDiaResponse {
  fecha: string;
  definido: boolean;
  desayuno: DesayunoMenu | null;
  platos: PlatoMenu[];
  opciones: OpcionMenu[];
  menusCompletos: MenuCompletoDia[];
}

export interface CandidatoMenu {
  id: string;
  nombre: string;
  tipo: 'Carta' | 'Componente';
  rol?: string | null;
  categoria?: string | null;
  precio?: number | null;
}

export interface GuardarMenuDiaRequest {
  productosCarta?: string[];
  opciones?: string[];
  menusCompletos?: number[];
  desayunoId?: string | null;
  platoIds?: string[];
}

export interface CambiarDisponibilidadRequest {
  agotado: boolean;
}

export interface CambiarDisponibilidadResponse {
  productoId: string;
  nombre: string;
  agotado: boolean;
}
