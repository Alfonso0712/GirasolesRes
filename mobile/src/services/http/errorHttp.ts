// MÓDULO PROTEGIDO: conexión. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

export type ApiErrorTipo = 'timeout' | 'sin-respuesta' | 'http';

export interface OpcionesApiError {
  status: number;
  mensaje: string;
  codigo?: string;
  errors?: Record<string, string | string[]>;
  detail?: string;
  tipo?: ApiErrorTipo;
  host?: string;
}

export class ApiError extends Error {
  public status: number;
  public codigo?: string;
  public mensaje: string;
  public detail?: string;
  public errors?: Record<string, string | string[]>;
  public tipo: ApiErrorTipo;
  public host?: string;

  constructor(opciones: OpcionesApiError) {
    super(opciones.mensaje);
    this.name = 'ApiError';
    this.status = opciones.status;
    this.mensaje = opciones.mensaje;
    this.codigo = opciones.codigo;
    this.errors = opciones.errors;
    this.detail = opciones.detail;
    this.tipo = opciones.tipo ?? 'http';
    this.host = opciones.host;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
