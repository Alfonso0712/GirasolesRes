export interface DesayunoMenuDto {
  id: string;
  nombre: string;
}

export interface PlatoMenuDto {
  productoId: string;
  nombre: string;
  categoria: string;
  precio: number;
  agotado: boolean;
}

export interface OpcionMenuDto {
  productoId: string;
  nombre: string;
  rol: string;
  agotado: boolean;
}

export interface OpcionParteDiaDto {
  productoId: string;
  nombre: string;
  agotado: boolean;
}

export interface MenuCompletoParteDiaDto {
  id: number;
  nombre: string;
  orden: number;
  rolesPermitidos: string[];
  opciones: OpcionParteDiaDto[];
}

export interface MenuCompletoDiaDto {
  id: number;
  nombre: string;
  precio: number;
  incluye: string | null;
  disponible: boolean;
  motivoNoDisponible?: string | null;
  partes: MenuCompletoParteDiaDto[];
}

export interface MenuDiaResponseDto {
  fecha: string;
  definido: boolean;
  desayuno?: DesayunoMenuDto | null;
  platos: PlatoMenuDto[];
  opciones: OpcionMenuDto[];
  menusCompletos: MenuCompletoDiaDto[];
}
