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
