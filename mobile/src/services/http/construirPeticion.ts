// MÓDULO PROTEGIDO: conexión. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

import { obtenerUrlBase } from '../../config/serverConfig';

export function agregarQueryParams(
  ruta: string,
  params?: Record<string, string | number | undefined | null>
): string {
  if (!params) return ruta;
  const searchParams = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      searchParams.append(clave, String(valor));
    }
  }
  const queryStr = searchParams.toString();
  if (!queryStr) return ruta;
  return `${ruta}${ruta.includes('?') ? '&' : '?'}${queryStr}`;
}

export function formatearUrl(endpoint: string): string {
  const base = obtenerUrlBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Si endpoint ya incluye /api y la base termina con /api, no duplicar
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api')) {
    return `${base.replace(/\/api$/, '')}${cleanEndpoint}`;
  }
  return `${base}${cleanEndpoint}`;
}

export function extraerHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

export function construirCabecerasJson(
  headersInit?: HeadersInit,
  body?: BodyInit | null,
  authToken?: string
): Headers {
  const headers = new Headers(headersInit || {});
  if (!headers.has('Content-Type') && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  return headers;
}

export function construirCabecerasBinario(authToken?: string): Headers {
  const headers = new Headers({
    Accept: 'application/pdf, application/octet-stream, */*',
  });
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  return headers;
}
