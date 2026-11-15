/**
 * Utilidades puras para inspección segura de errores desconocidos sin aserciones inseguras.
 */

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
