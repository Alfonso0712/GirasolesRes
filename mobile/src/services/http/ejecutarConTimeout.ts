// MÓDULO PROTEGIDO: conexión. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

import { lanzarErrorHttp, normalizarErrorCatch } from './clasificarFallo';
import type { PerfilMensajesError } from './clasificarFallo';

export interface OpcionesTransporte<T> {
  url: string;
  init: RequestInit;
  timeoutMs: number;
  host: string;
  perfilError: PerfilMensajesError;
  interpretar: (response: Response) => Promise<T>;
}

function emitirEventoRed(nombre: string, detail?: unknown): void {
  if (typeof window === 'undefined') return;
  const evento = detail === undefined ? new CustomEvent(nombre) : new CustomEvent(nombre, { detail });
  window.dispatchEvent(evento);
}

export async function ejecutarPeticionHttp<T>(opciones: OpcionesTransporte<T>): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opciones.timeoutMs);

  try {
    const response = await fetch(opciones.url, {
      ...opciones.init,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    emitirEventoRed('girasoles:network-success');

    if (!response.ok) {
      return await lanzarErrorHttp(response, opciones.host, opciones.perfilError);
    }

    return await opciones.interpretar(response);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    emitirEventoRed('girasoles:network-error', err);
    return normalizarErrorCatch(err, controller.signal.aborted, opciones.host, opciones.perfilError);
  }
}
