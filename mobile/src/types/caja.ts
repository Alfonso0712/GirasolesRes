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
  fechaApertura: string;
  fechaCierre?: string;
  cajero: string;
  montoInicial: number;
  totalVentas: number;
  diferencia: number;
  estadoCuadre: string;
}

export interface ListarCierresResponseDto {
  items: HistorialCierresItemDto[];
  total?: number;
}
