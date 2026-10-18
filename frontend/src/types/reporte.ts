export interface VentasAnuladasResumen {
  cantidad: number;
  monto: number;
}

export interface VentaPorDia {
  fecha: string;
  nVentas: number;
  efectivo: number;
  yape: number;
  total: number;
  conAjustes: boolean;
}

export interface ReporteVentasResponse {
  desde: string;
  hasta: string;
  nVentas: number;
  total: number;
  efectivo: number;
  yape: number;
  anuladas: VentasAnuladasResumen;
  porDia: VentaPorDia[];
}

export interface SubtotalCategoria {
  categoria: string;
  cantidad: number;
  monto: number;
}

export interface ItemPlatoVendido {
  productoId: string;
  producto: string;
  categoria: string;
  activo: boolean;
  cantidad: number;
  monto: number;
}

export interface PlatoPorDia {
  fecha: string;
  cantidad: number;
}

export interface ReportePlatosResponse {
  totalPlatos: number;
  totalMonto: number;
  totalVentas: number;
  coincide: boolean;
  subtotales: SubtotalCategoria[];
  items: ItemPlatoVendido[];
  porDia?: PlatoPorDia[] | null;
}

export type TipoAtajoFecha = 'hoy' | 'ayer' | 'ultimos7' | 'esteMes' | 'mesAnterior';
export type CriterioOrdenPlatos = 'cantidad' | 'monto' | 'nombre';
