export interface LineaComanda {
  producto: string;
  elecciones?: string | null;
  incluye?: string | null;
  cantidad: number;
  observacion?: string;
}

export interface ComandaKdsItem {
  id: string;
  pedidoNumero: number;
  tipo: 'Mesa' | 'ParaLlevar';
  mesa: string | null;
  referencia: string | null;
  horaLlegada: string;
  fechaHoraLlegadaUtc: string;
  estado: 'Pendiente' | 'EnPreparacion' | 'Lista';
  etiqueta: string | null; // "ADICIONAL" | "MODIFICADA" | null
  esAdicional: boolean;
  numeroAdicional: number;
  modificada: boolean;
  registradoPor: string;
  minutosEspera: number;
  esDemora: boolean;
  lineas: LineaComanda[];
}

export interface ResumenProducto {
  producto: string;
  cantidad: number;
}

export interface ListarComandasResponse {
  items: ComandaKdsItem[];
  resumen: ResumenProducto[];
}

export interface ActualizarEstadoComandaResponse {
  id: string;
  estado: string;
  deshacerHasta: string;
  mensaje: string;
}

export interface DeshacerEstadoComandaResponse {
  id: string;
  estado: string;
  mensaje: string;
}
