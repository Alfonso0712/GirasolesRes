export interface PedidoPendienteCobro {
  pedidoId: string;
  mesaId?: string;
  mesaNombre: string;
  mozoNombre: string;
  total: number;
  fechaCreacion?: string;
  cantidadLineas: number;
}

export type MetodoPago = 'Efectivo' | 'Yape';

export interface CobroRequest {
  solicitudId: string;
  pedidoId: string;
  totalMostrado: number;
  metodo: MetodoPago;
  montoRecibido?: number;
  yapeConfirmado?: boolean;
  yapeReferencia?: string;
  tipoComprobante?: string;
  tipoDocReceptor?: string;
  numDocReceptor?: string;
  razonSocialReceptor?: string;
  direccionReceptor?: string;
}

export interface CobroResponse {
  ventaId: string;
  mensaje: string;
  vuelto?: number;
}
