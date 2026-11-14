export interface AperturaActualDto {
  cajaId: string;
  fechaApertura: string;
  fechaAperturaLocal?: string;
  montoInicial: number;
  idUsuarioApertura: string;
  nombreUsuarioApertura: string;
}

export interface ResumenParcialDto {
  totalVentas: number;
  totalEfectivo: number;
  totalYape: number;
  cantidadVentas: number;
}

export interface CajaActualResponseDto {
  estado: 'sinCaja' | 'abierta' | 'anteriorSinCerrar' | string;
  mensaje?: string;
  apertura?: AperturaActualDto;
  resumenParcial?: ResumenParcialDto;
  sugerenciaMontoInicial?: number;
}

export interface AbrirCajaRequestDto {
  solicitudId: string;
  montoInicial: number;
  montoApertura?: number;
  observaciones?: string;
}

export interface PedidoPendienteCierreDto {
  pedidoId: string;
  numero: number;
  tipo: string;
  mesa?: string | null;
  total: number;
}

export interface PlatoVendidoResumenDto {
  nombre: string;
  cantidad: number;
  total: number;
}

export interface CierreResumenDto {
  cajaId: string;
  fechaApertura: string;
  fechaAperturaLocal?: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasYape: number;
  totalVentas: number;
  efectivoEsperado: number;
  cantidadVentas: number;
  pedidosPendientes?: PedidoPendienteCierreDto[];
  pedidosPendientesCobro?: number;
  platosVendidos?: PlatoVendidoResumenDto[];
}

export interface CerrarCajaRequestDto {
  solicitudId: string;
  efectivoContado: number;
  montoCierreEfectivo?: number;
  efectivoEsperadoMostrado: number;
  montoCierreSistema?: number;
  observacion?: string;
  observaciones?: string;
}

export interface HistorialCierresItemDto {
  cajaId: string;
  id?: string;
  fechaApertura: string;
  fechaAperturaLocal?: string;
  fechaCierre?: string;
  fechaCierreLocal?: string;
  cajero: string;
  cajeroApertura?: string;
  cajeroCierre?: string;
  montoInicial: number;
  totalVentas: number;
  ventasEfectivo?: number;
  ventasYape?: number;
  efectivoEsperado?: number;
  efectivoContado?: number;
  diferencia: number;
  estado?: string;
  estadoCuadre?: string;
  resultado?: string | null;
  conAjustes?: boolean;
  tieneAjustesPosteriores?: boolean;
  observacion?: string | null;
}

export interface ListarCierresResponseDto {
  items: HistorialCierresItemDto[];
  total?: number;
  pagina?: number;
  tamano?: number;
  totalPaginas?: number;
}

export interface AjustePosteriorDto {
  ventaId: string;
  comprobante: string;
  fechaVentaUtc: string;
  fechaVentaLocal: string;
  fechaAnulacion?: string | null;
  total: number;
  metodoPago: string;
  motivo?: string | null;
  usuarioAnulacion?: string | null;
}

export interface CierreDetalleDto {
  id?: string;
  cajaId: string;
  cierreId?: string;
  fechaApertura: string;
  fechaAperturaLocal?: string;
  fechaCierre?: string;
  fechaCierreLocal?: string;
  cajeroApertura: string;
  cajeroCierre?: string;
  estado: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasYape: number;
  totalVentas: number;
  efectivoEsperado: number;
  efectivoContado?: number;
  diferencia?: number;
  estadoCuadre?: string;
  resultado?: string | null;
  observacion?: string | null;
  cantidadVentas: number;
  platos?: PlatoVendidoResumenDto[];
  platosVendidos?: PlatoVendidoResumenDto[];
  ajustesPosteriores?: AjustePosteriorDto[];
}
