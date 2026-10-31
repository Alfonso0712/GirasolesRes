/**
 * Cliente HTTP base centralizado (Clean Frontend Architecture).
 * Encapsula la configuración de cabeceras, serialización JSON,
 * adjunción de tokens JWT y mapeo homogéneo de errores HTTP (incluyendo 401 y red).
 */

import {
  DEFAULT_CONNECTION_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  SESSION_STORAGE_KEY,
} from '../utils/constants';

export {
  DEFAULT_CONNECTION_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  SESSION_STORAGE_KEY,
};
export const CONNECTION_ERROR_MESSAGE = DEFAULT_CONNECTION_ERROR_MESSAGE;

export interface ApiClientError extends Error {
  status?: number;
  errors?: Record<string, string>;
  field?: string;
  detail?: string;
  isConnectionError?: boolean;
  [key: string]: any;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: any;
  responseType?: 'json' | 'blob';
}

export interface JwtValidationResult {
  valid: boolean;
  reason?: 'missing' | 'malformed' | 'expired';
  expMs?: number;
}

/**
 * Decodifica el payload del JWT con atob y verifica que exista y que su claim exp
 * no haya vencido (con margen de seguridad configurable, por defecto 10 s).
 */
export function validateJwtToken(
  token: string | undefined | null,
  marginSeconds = 10
): JwtValidationResult {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { valid: false, reason: 'missing' };
  }

  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3 || !parts[1]) {
      return { valid: false, reason: 'malformed' };
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    const payload = JSON.parse(decoded);

    if (!payload || typeof payload.exp !== 'number') {
      return { valid: false, reason: 'malformed' };
    }

    const nowSeconds = Date.now() / 1000;
    if (payload.exp <= nowSeconds + marginSeconds) {
      return { valid: false, reason: 'expired', expMs: payload.exp * 1000 };
    }

    return { valid: true, expMs: payload.exp * 1000 };
  } catch {
    return { valid: false, reason: 'malformed' };
  }
}

/**
 * Limpia el token, datos de usuario y cualquier caché de sesión.
 */
export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore storage access errors
  }
  try {
    sessionStorage.clear();
  } catch {
    // ignore storage access errors
  }
}

type UnauthorizedHandler = (banner: {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}) => void;

let onUnauthorizedCallback: UnauthorizedHandler | null = null;
let isLoggingOut401 = false;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorizedCallback = handler;
}

export function resetUnauthorizedGuard(): void {
  isLoggingOut401 = false;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://girasoles.astrazynk.pp.ua' : '');

export function resolveApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
}

function isPublicAuthEndpoint(endpoint: string): boolean {
  return (
    endpoint.includes('/api/auth/login') ||
    endpoint.includes('/api/auth/forgot-password') ||
    endpoint.includes('/api/auth/reset-password') ||
    endpoint.includes('/api/auth/logout')
  );
}

function triggerGlobalUnauthorized(): void {
  if (isLoggingOut401) return;
  isLoggingOut401 = true;
  clearStoredSession();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.history.replaceState(null, '', '/login');
  }
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback({
      type: 'warning',
      message: SESSION_EXPIRED_MESSAGE,
    });
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers: customHeaders, responseType = 'json', ...restOptions } = options;

  const headers: Record<string, string> = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(resolveApiUrl(endpoint), {
      ...restOptions,
      headers,
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    const netErr: ApiClientError = new Error(CONNECTION_ERROR_MESSAGE);
    netErr.status = 0;
    netErr.isConnectionError = true;
    throw netErr;
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (responseType === 'blob' && response.ok) {
    const blobData = await response.blob();
    return blobData as unknown as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson =
    contentType.includes('application/json') || contentType.includes('application/problem+json');
  const responseBody = isJson ? await response.json().catch(() => ({})) : {};

  if (!response.ok || (responseBody && responseBody.success === false)) {
    const isAuthRequest = Boolean(token) && !isPublicAuthEndpoint(endpoint);

    if (response.status === 401 && isAuthRequest) {
      triggerGlobalUnauthorized();
      const err401: ApiClientError = new Error(SESSION_EXPIRED_MESSAGE);
      err401.status = 401;
      throw err401;
    }

    const isGatewayOrBackendDown =
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504 ||
      (response.status >= 500 &&
        !isJson &&
        !responseBody?.message &&
        !responseBody?.title &&
        !responseBody?.detail);

    if (isGatewayOrBackendDown) {
      const connErr: ApiClientError = new Error(CONNECTION_ERROR_MESSAGE);
      connErr.status = response.status;
      connErr.isConnectionError = true;
      throw connErr;
    }

    const defaultMsg =
      response.status === 401
        ? SESSION_EXPIRED_MESSAGE
        : 'Error de comunicación con el servidor.';

    const msg = responseBody.message || responseBody.mensaje || defaultMsg;
    const err: ApiClientError = new Error(msg);
    err.status = response.status;
    err.field = responseBody.field;
    err.errors = responseBody.errors;
    err.detail = responseBody.detail;
    Object.assign(err, responseBody);
    throw err;
  }

  return responseBody as T;
}

export const apiClient = {
  get: <T>(endpoint: string, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'GET', token }),

  getBlob: (endpoint: string, token?: string): Promise<Blob> =>
    request<Blob>(endpoint, { method: 'GET', token, responseType: 'blob' }),

  post: <T>(endpoint: string, body?: any, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'POST', body, token }),

  put: <T>(endpoint: string, body?: any, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'PUT', body, token }),

  patch: <T>(endpoint: string, body?: any, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'PATCH', body, token }),

  delete: <T>(endpoint: string, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'DELETE', token }),
};
