export interface PedidoPendienteCobro {
  pedidoId: string;
  numero: number;
  tipo: string;
  mesa?: string | null;
  referencia?: string | null;
  hora: string;
  estado: string;
  total: number;
  estaListo: boolean;
}

export interface CobroRequest {
  pedidoId: string;
  solicitudId: string;
  totalMostrado: number;
  metodo: 'efectivo' | 'yape';
  montoRecibido?: number | null;
  yapeConfirmado?: boolean | null;
  yapeReferencia?: string | null;
}

export interface ComprobanteResumen {
  serie: string;
  numero: number;
  numeroFormateado: string;
  fechaHoraUtc: string;
  fechaHoraLocal: string;
}

export interface CobroResponse {
  ventaId: string;
  comprobante: ComprobanteResumen;
  vuelto: number;
  mensaje: string;
}

export interface ComprobanteLinea {
  cantidad: number;
  productoNombre: string;
  precioUnitario: number;
  subtotal: number;
  observacion?: string | null;
}

export interface ComprobanteDetalle {
  comprobanteId: string;
  ventaId: string;
  serie: string;
  numero: number;
  numeroFormateado: string;
  fechaHoraUtc: string;
  fechaHoraFormateada: string;
  pedidoNumero: number;
  tipoPedido: string;
  mesaNombre?: string | null;
  referencia?: string | null;
  cajeroNombre: string;
  lineas: ComprobanteLinea[];
  total: number;
  metodoPago: string;
  montoRecibido?: number | null;
  vuelto?: number | null;
  yapeReferencia?: string | null;
  leyenda: string;
  esCopia: boolean;
}
