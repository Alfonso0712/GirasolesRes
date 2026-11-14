export type EstadoMesa = 'Libre' | 'Ocupada' | 'Inactiva';

export interface MesaItem {
  id: string;
  nombre: string;
  ocupacion: 'Libre' | 'Ocupada';
  activa: boolean;
  pedidosAbiertos?: number;
  totalPendiente?: number;
  minutosOcupada?: number;
  mozo?: string | null;
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

export interface MesaMutationResponse {
  id: string;
  nombre: string;
  ocupacion: 'Libre' | 'Ocupada';
  activa: boolean;
  success?: boolean;
  message?: string;
}
