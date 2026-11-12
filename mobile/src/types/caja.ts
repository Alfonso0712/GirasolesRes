export type EstadoOperativoCaja = 'sinCaja' | 'abierta' | 'anteriorSinCerrar';

export interface AperturaCajaDto {
  cajaId: string;
  fechaApertura: string;
  fechaAperturaLocal?: string;
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
  apertura: AperturaCajaDto | null;
  resumenParcial: ResumenParcialCajaDto | null;
  sugerenciaMontoInicial: number | null;
  mensaje?: string;
}

export interface AbrirCajaRequestDto {
  solicitudId: string;
  montoInicial: number;
}

export interface CierreResumenDto {
  cajaId: string;
  fechaApertura: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasYape: number;
  totalVentas: number;
  efectivoEsperado: number;
  cantidadVentas: number;
}

export interface CerrarCajaRequestDto {
  solicitudId: string;
  efectivoContado: number;
  efectivoEsperadoMostrado: number;
  observacion?: string;
}

export interface HistorialCierresItemDto {
  cajaId: string;
  fechaApertura: string;
  fechaCierre: string | null;
  cajero: string;
  montoInicial: number;
  totalVentas: number;
  diferencia: number;
  estadoCuadre: string;
}
