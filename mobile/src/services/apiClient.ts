/**
 * Cliente HTTP base para la aplicación móvil de Restaurante Girasoles.
 * Configuración centralizada, timeout de 15s con AbortController,
 * manejo normalizado de errores (ApiError) y renovación preventiva de token JWT.
 */

export const DEFAULT_API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://girasolesres.pp.ua/api';

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem('GIRASOLES_API_BASE');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, '');
  }
  return DEFAULT_API_BASE.replace(/\/$/, '');
}

export function setApiBaseUrl(url: string): void {
  if (!url || !url.trim()) {
    localStorage.removeItem('GIRASOLES_API_BASE');
  } else {
    localStorage.setItem('GIRASOLES_API_BASE', url.trim().replace(/\/$/, ''));
  }
}

export class ApiError extends Error {
  public status: number;
  public codigo?: string;
  public mensaje: string;
  public detail?: string;
  public errors?: Record<string, string | string[]>;

  constructor(
    status: number,
    mensaje: string,
    codigo?: string,
    errors?: Record<string, string | string[]>,
    detail?: string
  ) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.mensaje = mensaje;
    this.codigo = codigo;
    this.errors = errors;
    this.detail = detail;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export function setOnUnauthorizedCallback(handler: UnauthorizedHandler | null): void {
  onUnauthorizedCallback = handler;
}

function handleUnauthorized(): void {
  try {
    localStorage.removeItem('GIRASOLES_TOKEN');
    localStorage.removeItem('GIRASOLES_SESSION');
  } catch {
    // Ignorar errores de acceso a almacenamiento
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('girasoles:unauthorized'));
  }

  if (onUnauthorizedCallback) {
    try {
      onUnauthorizedCallback();
    } catch {
      // Ignorar errores del callback
    }
  }
}

function parseJwtExp(token: string): number | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload) as { exp?: unknown };
    return typeof parsed.exp === 'number' ? parsed.exp : null;
  } catch {
    return null;
  }
}

function updateStoredToken(newToken: string): void {
  try {
    localStorage.setItem('GIRASOLES_TOKEN', newToken);
    const rawSession = localStorage.getItem('GIRASOLES_SESSION');
    if (rawSession) {
      const sessionObj = JSON.parse(rawSession) as Record<string, unknown>;
      sessionObj.token = newToken;
      localStorage.setItem('GIRASOLES_SESSION', JSON.stringify(sessionObj));
    }
  } catch {
    // Ignorar errores de acceso a almacenamiento
  }
}

let renewalPromise: Promise<string | null> | null = null;

async function intentarRenovarToken(currentToken: string): Promise<string | null> {
  if (renewalPromise) {
    return renewalPromise;
  }

  renewalPromise = (async () => {
    try {
      const base = getApiBaseUrl();
      const cleanBase = base.endsWith('/api') ? base : `${base}/api`;
      const url = `${cleanBase}/auth/renovar`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = (await res.json()) as { token?: string; data?: { token?: string } };
      const nuevoToken = data.token || data.data?.token;
      if (nuevoToken && typeof nuevoToken === 'string') {
        updateStoredToken(nuevoToken);
        return nuevoToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      renewalPromise = null;
    }
  })();

  return renewalPromise;
}

class ApiClient {
  private formatUrl(endpoint: string): string {
    const base = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Si endpoint ya incluye /api y la base termina con /api, no duplicar
    if (base.endsWith('/api') && cleanEndpoint.startsWith('/api')) {
      return `${base.replace(/\/api$/, '')}${cleanEndpoint}`;
    }
    return `${base}${cleanEndpoint}`;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    const isAuthSpecialEndpoint =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/logout') ||
      endpoint.includes('/auth/renovar');

    let authToken = token || localStorage.getItem('GIRASOLES_TOKEN') || undefined;

    // Renovación preventiva de token si vence en menos de 5 minutos (300 s)
    if (authToken && !isAuthSpecialEndpoint) {
      const exp = parseJwtExp(authToken);
      if (exp !== null) {
        const nowSeconds = Math.floor(Date.now() / 1000);
        const segundosRestantes = exp - nowSeconds;
        if (segundosRestantes > 0 && segundosRestantes < 300) {
          const tokenRenovado = await intentarRenovarToken(authToken);
          if (tokenRenovado) {
            authToken = tokenRenovado;
          }
        }
      }
    }

    const url = this.formatUrl(endpoint);
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let backendMsg: string | undefined;
        let codigo: string | undefined;
        let fieldErrors: Record<string, string | string[]> | undefined;
        let errorDetail: string | undefined;

        try {
          const errorJson = (await response.json()) as {
            mensaje?: string;
            message?: string;
            detail?: string;
            title?: string;
            codigo?: string;
            errors?: Record<string, string | string[]>;
          };
          backendMsg = errorJson.mensaje || errorJson.message || errorJson.detail || errorJson.title;
          codigo = errorJson.codigo;
          fieldErrors = errorJson.errors;
          errorDetail = errorJson.detail || errorJson.title;
        } catch {
          // La respuesta no es JSON
        }

        if (response.status === 401) {
          handleUnauthorized();
          throw new ApiError(
            401,
            'Sesión expirada. Inicie sesión nuevamente.',
            codigo || 'UNAUTHORIZED',
            fieldErrors,
            errorDetail
          );
        }

        if (response.status === 403) {
          throw new ApiError(
            403,
            'No tiene permiso para realizar esta acción.',
            codigo || 'FORBIDDEN',
            fieldErrors,
            errorDetail
          );
        }

        if (response.status >= 500) {
          throw new ApiError(
            response.status,
            'Ocurrió un error en el servidor. Intente nuevamente más tarde.',
            codigo || 'SERVER_ERROR',
            fieldErrors,
            errorDetail
          );
        }

        const mensajeCliente =
          backendMsg || 'Solicitud inválida. Verifique los datos ingresados.';

        throw new ApiError(
          response.status,
          mensajeCliente,
          codigo || 'BAD_REQUEST',
          fieldErrors,
          errorDetail
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      if (
        (err instanceof Error && err.name === 'AbortError') ||
        controller.signal.aborted
      ) {
        throw new ApiError(
          0,
          'No se pudo conectar con el servidor. Verifique su conexión.',
          'ERR_TIMEOUT'
        );
      }

      if (
        err instanceof Error &&
        (err.name === 'TypeError' || err.message.toLowerCase().includes('fetch'))
      ) {
        throw new ApiError(
          0,
          'No se pudo conectar con el servidor. Verifique su conexión.',
          'ERR_CONEXION'
        );
      }

      throw new ApiError(
        0,
        'No se pudo conectar con el servidor. Verifique su conexión.',
        'ERR_DESCONOCIDO'
      );
    }
  }

  get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  post<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    );
  }

  patch<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    );
  }

  put<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    );
  }

  delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }
}

export const apiClient = new ApiClient();
