export interface CajaEstado {
  estaAbierta: boolean;
  cajaId?: string | null;
  montoApertura?: number | null;
  fechaAperturaUtc?: string | null;
  fechaAperturaLocal?: string | null;
  cajeroNombre?: string | null;
}

export interface AbrirCajaRequest {
  montoApertura: number;
}
