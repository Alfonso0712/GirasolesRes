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

export interface MenuDiaResponse {
  fecha: string;
  definido: boolean;
  desayuno: DesayunoMenu | null;
  platos: PlatoMenu[];
}

export interface CandidatoMenu {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
}

export interface GuardarMenuDiaRequest {
  desayunoId?: string | null;
  platoIds: string[];
}

export interface CambiarDisponibilidadRequest {
  agotado: boolean;
}

export interface CambiarDisponibilidadResponse {
  productoId: string;
  nombre: string;
  agotado: boolean;
}
