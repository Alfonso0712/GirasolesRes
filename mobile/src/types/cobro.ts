export interface PedidoPendienteCobro {
  pedidoId: string;
  mesaId: string;
  mesaNombre: string;
  mozoNombre: string;
  total: number;
  fechaCreacion: string;
  cantidadLineas: number;
}

export type MetodoPago = 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta';

export interface CobroRequest {
  pedidoId: string;
  metodoPago: MetodoPago;
  montoRecibido?: number;
  tipoComprobante: 'Boleta' | 'Factura';
  documentoCliente?: string;
  nombreCliente?: string;
}

export interface CobroResponse {
  ventaId: string;
  mensaje: string;
  total: number;
  vuelto: number;
}
