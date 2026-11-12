export interface ComandaLinea {
  productoId: string;
  nombre: string;
  cantidad: number;
  observaciones?: string;
  estado: string;
}

export interface ComandaItem {
  id: string;
  numero: number;
  mesaNombre: string;
  mozoNombre: string;
  fechaCreacion: string;
  minutosEspera: number;
  estado: 'pendiente' | 'enPreparacion' | 'lista';
  lineas: ComandaLinea[];
}

export interface ListarComandasResponse {
  pendientes: ComandaItem[];
  enPreparacion: ComandaItem[];
  listas: ComandaItem[];
}
