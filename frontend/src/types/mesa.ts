export type OcupacionMesa = 'Libre' | 'Ocupada';

export type FiltroEstadoMesa = 'todas' | 'libre' | 'ocupada';

export interface MesaItem {
  id: string;
  nombre: string;
  ocupacion: OcupacionMesa;
  activa: boolean;
}

export interface CrearMesaData {
  nombre: string;
}

export interface ActualizarMesaData {
  nombre: string;
}

export interface CambiarEstadoMesaData {
  activa: boolean;
}

export interface ResumenMesas {
  total: number;
  libres: number;
  ocupadas: number;
  inactivas: number;
}
