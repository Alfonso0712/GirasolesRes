export interface ReporteVentasResponse {
  desde: string;
  hasta: string;
  nVentas: number;
  total: number;
  efectivo: number;
  yape: number;
}

export interface ItemPlatoVendido {
  productoId: string;
  producto: string;
  categoria: string;
  cantidad: number;
  monto: number;
}

export interface ReportePlatosResponse {
  totalPlatos: number;
  totalMonto: number;
  totalVentas: number;
  items: ItemPlatoVendido[];
}
