import { useState, useRef, useEffect, useCallback } from 'react';
import { comprobanteService } from '../services/comprobanteService';
import {
  abrirPdf,
  guardarPdf,
  compartirPdf,
  nombreArchivoComprobante,
} from '../utils/archivos';
import { useHaptics } from './useHaptics';

export type TipoAccionComprobante = 'imprimir' | 'guardar' | 'compartir';
export type EstadoAccionComprobante = 'inactivo' | 'generando' | 'ok' | 'error';

export interface DatosComprobanteAccion {
  ventaId: string;
  numero: string;
  total: number;
  fecha: string;
  esCopia?: boolean;
  anulada?: boolean;
}

export interface EstadosPorAccionComprobante {
  imprimir: EstadoAccionComprobante;
  guardar: EstadoAccionComprobante;
  compartir: EstadoAccionComprobante;
}

const ESTADOS_INICIALES: EstadosPorAccionComprobante = {
  imprimir: 'inactivo',
  guardar: 'inactivo',
  compartir: 'inactivo',
};

/**
 * Hook que administra las acciones de PDF de un comprobante (`Imprimir`, `Guardar PDF`, `Compartir PDF`).
 * Descarga UN solo `Blob` en memoria mientras la hoja permanezca abierta para la misma venta y modo (`esCopia`),
 * reutilizándolo entre acciones sin volver a pedirlo al servidor ni guardarlo en almacenamiento persistente.
 */
export function useComprobanteAcciones(venta: DatosComprobanteAccion | null) {
  const [estados, setEstados] = useState<EstadosPorAccionComprobante>(ESTADOS_INICIALES);
  const [accionActiva, setAccionActiva] = useState<TipoAccionComprobante | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [avisoExito, setAvisoExito] = useState<string | null>(null);

  const blobCacheRef = useRef<{ clave: string; blob: Blob } | null>(null);
  const { triggerSuccess, triggerError } = useHaptics();

  const claveActual = venta ? `${venta.ventaId}:${Boolean(venta.esCopia)}` : null;

  useEffect(() => {
    blobCacheRef.current = null;
    setEstados(ESTADOS_INICIALES);
    setAccionActiva(null);
    setErrorMensaje(null);
    setAvisoExito(null);

    return () => {
      blobCacheRef.current = null;
    };
  }, [claveActual]);

  const obtenerBlobComprobante = useCallback(async (): Promise<Blob> => {
    if (!venta || !claveActual) {
      throw new Error('No hay comprobante seleccionado.');
    }

    if (blobCacheRef.current && blobCacheRef.current.clave === claveActual) {
      return blobCacheRef.current.blob;
    }

    const blob = await comprobanteService.descargarPdfComprobante(venta.ventaId, {
      copia: Boolean(venta.esCopia),
    });
    blobCacheRef.current = { clave: claveActual, blob };
    return blob;
  }, [venta, claveActual]);

  const ejecutarAccion = useCallback(
    async (tipo: TipoAccionComprobante) => {
      if (!venta || venta.anulada || accionActiva !== null) return;

      setAccionActiva(tipo);
      setErrorMensaje(null);
      setAvisoExito(null);
      setEstados((prev) => ({ ...prev, [tipo]: 'generando' }));

      try {
        const blob = await obtenerBlobComprobante();
        const nombreArchivo = nombreArchivoComprobante(venta.numero);

        if (tipo === 'imprimir') {
          await abrirPdf(blob, nombreArchivo);
          setAvisoExito('Comprobante listo para imprimir.');
        } else if (tipo === 'guardar') {
          const metodo = await guardarPdf(blob, nombreArchivo);
          setAvisoExito(
            metodo === 'documentos'
              ? `PDF guardado en Documentos/Girasoles (${nombreArchivo}).`
              : 'Seleccione dónde guardar el comprobante PDF.'
          );
        } else {
          await compartirPdf(blob, nombreArchivo);
          setAvisoExito('Hoja para compartir abierta.');
        }

        setEstados((prev) => ({ ...prev, [tipo]: 'ok' }));
        triggerSuccess();
      } catch (err: unknown) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : 'No se pudo obtener el comprobante en PDF.';
        setEstados((prev) => ({ ...prev, [tipo]: 'error' }));
        setErrorMensaje(msg);
        triggerError();
      } finally {
        setAccionActiva(null);
      }
    },
    [venta, accionActiva, obtenerBlobComprobante, triggerSuccess, triggerError]
  );

  const imprimir = useCallback(() => ejecutarAccion('imprimir'), [ejecutarAccion]);
  const guardar = useCallback(() => ejecutarAccion('guardar'), [ejecutarAccion]);
  const compartir = useCallback(() => ejecutarAccion('compartir'), [ejecutarAccion]);

  const limpiarMensajes = useCallback(() => {
    setErrorMensaje(null);
    setAvisoExito(null);
  }, []);

  const limpiarCache = useCallback(() => {
    blobCacheRef.current = null;
  }, []);

  return {
    estados,
    accionActiva,
    ocupado: accionActiva !== null,
    errorMensaje,
    avisoExito,
    imprimir,
    guardar,
    compartir,
    limpiarMensajes,
    limpiarCache,
  };
}
