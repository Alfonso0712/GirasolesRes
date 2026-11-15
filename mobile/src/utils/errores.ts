/**
 * Utilidades puras para inspección segura de errores desconocidos sin aserciones inseguras.
 */

export interface ErrorApiLike {
  name: 'ApiError';
  status: number;
  mensaje: string;
}

export function extraerEstadoError(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = err.status;
    if (typeof status === 'number') {
      return status;
    }
  }
  return undefined;
}

export function extraerMensajeError(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null) {
    if ('mensaje' in err && typeof err.mensaje === 'string' && err.mensaje) {
      return err.mensaje;
    }
    if ('message' in err && typeof err.message === 'string' && err.message) {
      return err.message;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return undefined;
}

export function esApiError(err: unknown): err is Error & ErrorApiLike {
  return (
    err instanceof Error &&
    err.name === 'ApiError' &&
    'status' in err &&
    typeof err.status === 'number' &&
    'mensaje' in err &&
    typeof err.mensaje === 'string'
  );
}

export function mensajeDeError(err: unknown, porDefecto: string): string {
  if (esApiError(err) && err.mensaje) {
    return err.mensaje;
  }
  return porDefecto;
}
