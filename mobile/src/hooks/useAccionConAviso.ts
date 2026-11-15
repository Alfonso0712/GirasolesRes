import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { extraerEstadoError, mensajeDeError } from '../utils/errores';

export interface OpcionesAccionConAviso {
  mensajeError: string;
  prefijoServidor?: string;
  reintentar?: () => void | Promise<void>;
  onError?: (err: unknown, mensaje: string) => void;
}

function resolverMensajeAccion(
  err: unknown,
  mensajeError: string,
  prefijoServidor?: string
): string {
  const detalle = mensajeDeError(err, '');
  if (detalle) {
    return prefijoServidor ? `${prefijoServidor} ${detalle}` : detalle;
  }
  return mensajeError;
}

/**
 * Envuelve una accion de usuario con captura uniforme de errores, ignorando 401
 * y mostrando un aviso Toast de error con accion "Reintentar" cuando corresponde.
 */
export function useAccionConAviso() {
  const { mostrar } = useToast();

  const ejecutar = useCallback(
    async (accion: () => Promise<void>, opciones: OpcionesAccionConAviso): Promise<boolean> => {
      try {
        await accion();
        return true;
      } catch (err: unknown) {
        if (extraerEstadoError(err) === 401) {
          return false;
        }
        const mensaje = resolverMensajeAccion(
          err,
          opciones.mensajeError,
          opciones.prefijoServidor
        );
        opciones.onError?.(err, mensaje);
        mostrar({
          tipo: 'error',
          mensaje,
          accion: opciones.reintentar
            ? {
                etiqueta: 'Reintentar',
                onClick: () => {
                  void opciones.reintentar?.();
                },
              }
            : undefined,
        });
        return false;
      }
    },
    [mostrar]
  );

  return { ejecutar };
}
