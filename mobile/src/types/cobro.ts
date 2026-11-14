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

export type TipoComprobante = 'Ticket' | 'Boleta' | 'Factura';

export interface CobroRequest {
  solicitudId: string;
  pedidoId: string;
  totalMostrado: number;
  metodo: MetodoPago | string;
  montoRecibido?: number;
  yapeConfirmado?: boolean;
  yapeReferencia?: string;
  tipoComprobante?: TipoComprobante | string;
  tipoDocReceptor?: 'DNI' | 'RUC' | string | null;
  numDocReceptor?: string | null;
  razonSocialReceptor?: string | null;
  direccionReceptor?: string | null;
}

export interface ComprobanteResumen {
  serie: string;
  numero: number;
  numeroFormateado: string;
  fechaHoraUtc?: string;
  fechaHoraLocal?: string;
}

export interface CobroResponse {
  ventaId: string;
  mensaje: string;
  vuelto?: number;
  comprobante?: ComprobanteResumen;
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
