// MÓDULO PROTEGIDO: conexión al servidor. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

import { MODO_DEMO } from './appConfig';

/**
 * URL base oficial de la API de Restaurante Girasoles.
 * NOTA CRÍTICA: Esta cadena literal debe figurar UNA SOLA VEZ en todo mobile/src/.
 */
export const URL_API_POR_DEFECTO: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://girasoles.astrazynk.pp.ua/api';

/**
 * Hosts expresamente prohibidos como URL de API.
 * girasolesres.pp.ua es el sitio web institucional, no expone la API del backend.
 */
export const HOSTS_BLOQUEADOS: readonly string[] = [
  'girasolesres.pp.ua', // sitio web, no es la API
];

export const STORAGE_KEY_API_BASE = 'GIRASOLES_API_BASE';

export interface NormalizacionResultado {
  url: string;
  error?: string;
  host: string;
  esInsegura: boolean;
  esBloqueado: boolean;
}

/**
 * Normaliza y valida una dirección de servidor:
 * - Aplica trim
 * - Exige http:// o https://
 * - Quita barras diagonales finales
 * - Agrega /api si no contiene ruta específica
 * - Detecta si el host pertenece a HOSTS_BLOQUEADOS
 */
export function normalizarUrl(valor: string): NormalizacionResultado {
  const limpio = (valor || '').trim();
  if (!limpio) {
    return {
      url: '',
      error: 'Ingrese una dirección de servidor válida.',
      host: '',
      esInsegura: false,
      esBloqueado: false,
    };
  }

  if (!/^https?:\/\//i.test(limpio)) {
    return {
      url: '',
      error: 'La dirección debe comenzar con http:// o https://',
      host: '',
      esInsegura: false,
      esBloqueado: false,
    };
  }

  let url = limpio.replace(/\/+$/, '');
  let host = '';

  try {
    const parsed = new URL(url);
    host = parsed.hostname;
    if (parsed.pathname === '' || parsed.pathname === '/') {
      url = `${url}/api`;
    }
  } catch {
    return {
      url: '',
      error: 'Formato de dirección URL inválido.',
      host: '',
      esInsegura: false,
      esBloqueado: false,
    };
  }

  const esInsegura = url.startsWith('http://');
  const hostLower = host.toLowerCase();
  const esBloqueado = HOSTS_BLOQUEADOS.some(
    (b) => hostLower === b.toLowerCase() || hostLower.endsWith(`.${b.toLowerCase()}`)
  );

  if (esBloqueado) {
    return {
      url,
      host,
      esInsegura,
      esBloqueado: true,
      error: 'Esta dirección es el sitio web de Girasoles, no la API.',
    };
  }

  return { url, host, esInsegura, esBloqueado: false };
}

export function leerUrlGuardada(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_API_BASE);
  } catch {
    return null;
  }
}

export function restablecerUrl(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_API_BASE);
  } catch {
    // Ignorar errores de acceso a almacenamiento local
  }
}

export function guardarUrl(valor: string): { ok: boolean; url: string; error?: string } {
  const norm = normalizarUrl(valor);
  if (norm.error || norm.esBloqueado) {
    return { ok: false, url: '', error: norm.error };
  }
  try {
    localStorage.setItem(STORAGE_KEY_API_BASE, norm.url);
    return { ok: true, url: norm.url };
  } catch {
    return { ok: false, url: '', error: 'No se pudo guardar la dirección en el dispositivo.' };
  }
}

let mensajeRestablecimientoPendiente: string | null = null;

export function consumirMensajeRestablecimiento(): string | null {
  const msg = mensajeRestablecimientoPendiente;
  mensajeRestablecimientoPendiente = null;
  return msg;
}

/**
 * Resuelve la URL base de la API para cada petición:
 * - En producción (!MODO_DEMO): ignora y borra siempre GIRASOLES_API_BASE.
 * - En MODO_DEMO: usa el valor guardado solo si es válido y no bloqueado;
 *   si no lo es, lo borra, usa la URL por defecto y registra aviso de restablecimiento.
 */
export function obtenerUrlBase(): string {
  if (!MODO_DEMO) {
    restablecerUrl();
    return URL_API_POR_DEFECTO.replace(/\/+$/, '');
  }

  const guardada = leerUrlGuardada();
  if (!guardada || !guardada.trim()) {
    return URL_API_POR_DEFECTO.replace(/\/+$/, '');
  }

  const norm = normalizarUrl(guardada);
  if (norm.error || norm.esBloqueado) {
    restablecerUrl();
    mensajeRestablecimientoPendiente =
      'Se restableció la dirección del servidor porque la guardada no era la API.';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('girasoles:servidor-restablecido', {
          detail: { mensaje: mensajeRestablecimientoPendiente },
        })
      );
    }
    return URL_API_POR_DEFECTO.replace(/\/+$/, '');
  }

  return norm.url;
}

export interface ResultadoPruebaConexion {
  exito: boolean;
  tipo: 'exito' | 'error';
  mensaje: string;
  detalle?: string;
  host: string;
}

/**
 * Prueba la conexión contra el endpoint {base}/auth/me sin token con timeout de 8 segundos.
 * Distingue explícitamente entre la API de backend (401 JSON) y un sitio web (HTML/200).
 */
export async function probarConexion(urlCandidata: string): Promise<ResultadoPruebaConexion> {
  const norm = normalizarUrl(urlCandidata);
  const host = norm.host || 'el servidor';

  if (norm.esBloqueado) {
    return {
      exito: false,
      tipo: 'error',
      mensaje: 'Esta dirección es el sitio web de Girasoles, no la API.',
      detalle: `Detalle: el host ${host} está registrado como sitio web institucional.`,
      host,
    };
  }

  if (norm.error) {
    return {
      exito: false,
      tipo: 'error',
      mensaje: norm.error,
      host,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const endpoint = `${norm.url.replace(/\/+$/, '')}/auth/me`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const esHtml = contentType.includes('text/html');
    const esJson = contentType.includes('application/json');

    // 401 con Content-Type application/json: Éxito verificado de la API
    if (res.status === 401 && esJson) {
      return {
        exito: true,
        tipo: 'exito',
        mensaje: 'Conexión correcta: se encontró la API de Girasoles.',
        host,
      };
    }

    // 200 o text/html: Es un sitio web
    if (res.status === 200 || esHtml) {
      return {
        exito: false,
        tipo: 'error',
        mensaje: 'La dirección responde, pero parece un sitio web y no la API de Girasoles. Revise la dirección.',
        detalle: `Detalle: respuesta HTTP ${res.status} (${contentType || 'sin tipo'}) de ${host}.`,
        host,
      };
    }

    // 404: Ruta de API no existe
    if (res.status === 404) {
      return {
        exito: false,
        tipo: 'error',
        mensaje: 'El servidor respondió, pero la ruta de la API no existe. Revise la dirección.',
        detalle: `Detalle: respuesta HTTP 404 de ${host}.`,
        host,
      };
    }

    // 5xx (incluidos 530 y 1033 de Cloudflare)
    if (res.status >= 500) {
      return {
        exito: false,
        tipo: 'error',
        mensaje: `El servidor o el túnel no está disponible en este momento (HTTP ${res.status}).`,
        detalle: `Detalle: respuesta HTTP ${res.status} de ${host}.`,
        host,
      };
    }

    return {
      exito: false,
      tipo: 'error',
      mensaje: 'La dirección responde, pero no devolvió el comportamiento esperado de la API. Revise la dirección.',
      detalle: `Detalle: respuesta HTTP ${res.status} de ${host}.`,
      host,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const esAbort =
      (err instanceof Error && err.name === 'AbortError') || controller.signal.aborted;
    return {
      exito: false,
      tipo: 'error',
      mensaje: 'No se pudo conectar con el servidor. Verifique la dirección y su conexión.',
      detalle: esAbort
        ? `Detalle: no hubo respuesta de ${host} en 8 s.`
        : `Detalle: no se obtuvo respuesta de ${host}. Verifique que sea la dirección de la API, que el servidor esté encendido y que la red lo permita.`,
      host,
    };
  }
}
