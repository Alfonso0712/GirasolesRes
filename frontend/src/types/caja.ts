// Tipos para CUS 13: Gestión de caja (Apertura, Cierre, Cuadre e Historial)

export type EstadoOperativoCaja = 'sinCaja' | 'abierta' | 'anteriorSinCerrar';

export interface AperturaCajaDto {
  cajaId: string;
  fechaApertura: string;
  fechaAperturaUtc?: string;
  fechaAperturaLocal: string;
  montoInicial: number;
  idUsuarioApertura: string;
  nombreUsuarioApertura: string;
}

export interface ResumenParcialCajaDto {
  totalVentas: number;
  totalEfectivo: number;
  totalYape: number;
  cantidadVentas: number;
}

export interface CajaActualResponseDto {
  estado: EstadoOperativoCaja;
  mensaje?: string;
  message?: string;
  apertura: AperturaCajaDto | null;
  resumenParcial: ResumenParcialCajaDto | null;
  sugerenciaMontoInicial: number | null;
}

export interface AbrirCajaRequestDto {
  solicitudId: string;
  montoInicial: number;
  montoApertura?: number;
}

export interface AbrirCajaResponseDto {
  cajaId: string;
  montoInicial: number;
  fechaApertura: string;
  fechaAperturaUtc?: string;
  fechaAperturaLocal?: string;
  estado?: string;
  mensaje: string;
  message?: string;
  solicitudId?: string;
  idUsuarioApertura?: string;
  nombreUsuarioApertura?: string;
  usuarioApertura?: string;
}

export interface PlatoVendidoResumenDto {
  nombre: string;
  cantidad: number;
  total: number;
  productoId?: string;
}

export type PlatoVendidoCierreDto = PlatoVendidoResumenDto;

export interface PedidoPendienteCierreDto {
  pedidoId: string;
  numero: number;
  tipo: string;
  mesa: string | null;
  total: number;
}

export interface CierreResumenDto {
  cajaId: string;
  fechaApertura: string;
  fechaAperturaLocal?: string;
  montoInicial: number;
  ventasEfectivo: number;
  efectivo?: number;
  ventasYape: number;
  yape?: number;
  totalVentas: number;
  total?: number;
  efectivoEsperado: number;
  cantidadVentas: number;
  platosVendidos: PlatoVendidoResumenDto[];
  pedidosPendientes: PedidoPendienteCierreDto[];
}

export interface CerrarCajaRequestDto {
  solicitudId: string;
  efectivoContado: number;
  efectivoEsperadoMostrado: number;
  observacion?: string;
}

export interface CerrarCajaResponseDto {
  cajaId: string;
  cierreId?: string;
  id?: string;
  montoInicial: number;
  efectivoEsperado: number;
  efectivoContado: number;
  diferencia: number;
  estadoCuadre: 'Cuadra' | 'Sobrante' | 'Faltante';
  mensaje: string;
  message?: string;
  fechaCierreUtc?: string;
  fechaCierreLocal?: string;
  solicitudId?: string;
}

export interface HistorialCierresItemDto {
  id?: string;
  cajaId: string;
  cierreId?: string;
  fechaApertura: string;
  fechaAperturaUtc?: string;
  fechaAperturaLocal?: string;
  fechaCierre: string | null;
  fechaCierreUtc?: string | null;
  fechaCierreLocal?: string | null;
  cajero: string;
  cajeroApertura?: string;
  cajeroCierre?: string | null;
  montoInicial: number;
  montoCierre?: number | null;
  efectivoContado: number | null;
  efectivoEsperado?: number | null;
  diferencia: number | null;
  ventasEfectivo?: number;
  ventasYape?: number;
  totalVentas?: number;
  efectivo: number;
  yape: number;
  total: number;
  estado: string;
  esAbierta?: boolean;
  resultado?: 'cuadra' | 'sobrante' | 'faltante' | string | null;
  tieneAjustesPosteriores?: boolean;
  conAjustes: boolean;
  observacion?: string | null;
}

export type CierreItemDto = HistorialCierresItemDto;

export interface HistorialCierresPaginadoDto {
  items: HistorialCierresItemDto[];
  total: number;
  pagina: number;
  tamano: number;
  totalPaginas: number;
  mensaje?: string | null;
}

export type ListarCierresResponseDto = HistorialCierresPaginadoDto;

export interface AjustePosteriorDto {
  ventaId: string;
  comprobante?: string;
  numeroComprobante?: string;
  fechaVentaUtc?: string;
  fechaVentaLocal?: string;
  fechaAnulacion?: string;
  fechaAnulacionUtc?: string | null;
  fechaAnulacionLocal?: string | null;
  total?: number;
  montoAnulado?: number;
  metodoPago: string;
  motivo?: string;
  usuarioAnulacion?: string;
}

export interface CierreDetalleDto {
  id?: string;
  cajaId: string;
  cierreId?: string;
  fechaApertura: string;
  fechaAperturaUtc?: string;
  fechaAperturaLocal?: string;
  fechaCierre: string | null;
  fechaCierreUtc?: string | null;
  fechaCierreLocal?: string | null;
  cajeroApertura: string;
  cajeroCierre: string | null;
  estado?: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasYape: number;
  totalVentas: number;
  efectivoEsperado: number;
  efectivoContado: number | null;
  diferencia: number | null;
  estadoCuadre?: string | null;
  resultado?: string | null;
  observacion: string | null;
  cantidadVentas?: number;
  platos?: PlatoVendidoResumenDto[];
  platosVendidos: PlatoVendidoResumenDto[];
  ajustesPosteriores: AjustePosteriorDto[];
  tieneAjustesPosteriores?: boolean;
  conAjustes?: boolean;
}

// Compatibilidad previa con CUS 11
export interface CajaEstado {
  estaAbierta: boolean;
  cajaId?: string | null;
  montoApertura?: number | null;
  fechaAperturaUtc?: string | null;
  fechaAperturaLocal?: string | null;
  cajeroNombre?: string | null;
  estadoOperativo?: EstadoOperativoCaja;
}

export interface AbrirCajaRequest {
  montoApertura: number;
}
