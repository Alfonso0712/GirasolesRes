import { useCallback, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { extraerEstadoError, mensajeDeError } from '../utils/errores';

export interface OpcionesAvisoTransicion {
  mensajePorDefecto: string;
  usarMensajeServidor?: boolean;
  reintentar?: () => void | Promise<void>;
}

/**
 * Emite avisos de error en cargas periodicas solo al transicionar de OK a fallo,
 * evitando alertas repetidas en cada intervalo y rearmandose tras un exito.
 */
export function useAvisoPorTransicion() {
  const { mostrar } = useToast();
  const enFalloRef = useRef(false);

  const registrarExito = useCallback(() => {
    enFalloRef.current = false;
  }, []);

  const registrarFallo = useCallback(
    (err: unknown, opciones: OpcionesAvisoTransicion): boolean => {
      if (extraerEstadoError(err) === 401) {
        return false;
      }
      if (enFalloRef.current) {
        return false;
      }
      enFalloRef.current = true;
      const mensaje = opciones.usarMensajeServidor
        ? mensajeDeError(err, opciones.mensajePorDefecto)
        : opciones.mensajePorDefecto;

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
      return true;
    },
    [mostrar]
  );

  return { registrarExito, registrarFallo };
}
