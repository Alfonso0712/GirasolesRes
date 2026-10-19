export interface VentaItem {
  ventaId: string;
  comprobante: string;
  fechaHora: string;
  fechaHoraFormateada: string;
  pedidoNumero: number;
  tipo: string;
  mesa?: string | null;
  referencia?: string | null;
  total: number;
  metodo: 'Efectivo' | 'Yape';
  cajero: string;
  estado: 'Vigente' | 'Anulada';
  tipoComprobante?: string;
  clienteDocumento?: string | null;
  clienteNombre?: string | null;
}

export interface ResumenVentas {
  vigentes: number;
  totalVigente: number;
  efectivo: number;
  yape: number;
  anuladas: number;
}

export interface ListarVentasResponse {
  items: VentaItem[];
  total: number;
  pagina: number;
  tamano: number;
  resumen: ResumenVentas;
}

export interface LineaVentaDetalle {
  cantidad: number;
  productoNombre: string;
  precioUnitario: number;
  subtotal: number;
  observacion?: string | null;
  elecciones?: string | null;
  incluye?: string | null;
}

export interface VentaDetalle {
  ventaId: string;
  comprobanteId: string;
  comprobante: string;
  fechaHoraUtc: string;
  fechaHoraFormateada: string;
  pedidoId: string;
  pedidoNumero: number;
  tipo: string;
  mesa?: string | null;
  referencia?: string | null;
  total: number;
  metodo: string;
  montoRecibido?: number | null;
  vuelto?: number | null;
  yapeReferencia?: string | null;
  cajero: string;
  estado: string;
  cajaCerrada: boolean;
  lineas: LineaVentaDetalle[];
  motivoAnulacion?: string | null;
  usuarioAnulacion?: string | null;
  fechaHoraAnulacionFormateada?: string | null;
  destinoPedido?: string | null;
  tipoComprobante?: string;
  tipoDocReceptor?: string | null;
  numDocReceptor?: string | null;
  razonSocialReceptor?: string | null;
  direccionReceptor?: string | null;
  opGravada?: number;
  igv?: number;
}

export interface AnularVentaRequest {
  solicitudId: string;
  motivo: string;
  destinoPedido: 'porCobrar' | 'anular';
}

export interface AnularVentaResponse {
  estado: string;
  pedidoEstado: string;
  comprobante: string;
  mensaje: string;
}

export interface FiltroVentasParams {
  busqueda?: string;
  desde?: string;
  hasta?: string;
  tipoComprobante?: string;
  pagina?: number;
  tamano?: number;
}
