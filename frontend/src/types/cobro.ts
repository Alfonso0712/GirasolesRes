export interface PedidoPendienteCobro {
  pedidoId: string;
  numero: number;
  tipo: string;
  mesa?: string | null;
  mesaId?: string | null;
  referencia?: string | null;
  hora: string;
  estado: string;
  total: number;
  estaListo: boolean;
}

export type TipoComprobante = 'Ticket' | 'Boleta' | 'Factura';

export interface CobroRequest {
  pedidoId: string;
  solicitudId: string;
  totalMostrado: number;
  metodo: 'efectivo' | 'yape';
  montoRecibido?: number | null;
  yapeConfirmado?: boolean | null;
  yapeReferencia?: string | null;
  tipoComprobante?: TipoComprobante;
  tipoDocReceptor?: 'DNI' | 'RUC' | null;
  numDocReceptor?: string | null;
  razonSocialReceptor?: string | null;
  direccionReceptor?: string | null;
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
  tipoComprobante: string;
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
  opGravada: number;
  igv: number;
  metodoPago: string;
  montoRecibido?: number | null;
  vuelto?: number | null;
  yapeReferencia?: string | null;
  leyenda: string;
  tipoDocReceptor?: string | null;
  numDocReceptor?: string | null;
  razonSocialReceptor?: string | null;
  direccionReceptor?: string | null;
  esCopia: boolean;
}

export interface ResultadoConsultaDni {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
}

export interface ResultadoConsultaRuc {
  ruc: string;
  razonSocial: string;
  estado?: string | null;
  condicion?: string | null;
  direccion?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
}
