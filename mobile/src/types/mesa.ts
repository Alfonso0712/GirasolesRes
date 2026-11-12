export type EstadoMesa = 'Libre' | 'Ocupada' | 'Inactiva';

export interface MesaItem {
  id: string;
  nombre: string;
  capacidad: number;
  ocupacion: 'Libre' | 'Ocupada';
  activa: boolean;
  pedidosAbiertos?: number;
  totalPendiente?: number;
  minutosOcupada?: number;
}
