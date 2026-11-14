export type EstadoMesa = 'Libre' | 'Ocupada' | 'Inactiva';

export interface PedidoMesaResumen {
  id: string;
  numero: number;
  estado: string;
  total: number;
  hora?: string;
}

export interface MesaItem {
  id: string;
  nombre: string;
  ocupacion: 'Libre' | 'Ocupada';
  activa: boolean;
  pedidosAbiertos?: number;
  totalPendiente?: number | null;
  minutosOcupada?: number | null;
  mozo?: string | null;
  pedidosMesa?: PedidoMesaResumen[];
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
