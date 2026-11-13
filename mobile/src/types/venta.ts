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

export interface FiltroVentasParams {
  busqueda?: string;
  desde?: string;
  hasta?: string;
  tipoComprobante?: string;
  pagina?: number;
  tamano?: number;
}
