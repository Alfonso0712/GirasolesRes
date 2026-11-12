
export const DEFAULT_API_BASE = 'https://girasoles.astrazynk.pp.ua/api';

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem('GIRASOLES_API_BASE');
  if (custom && custom.trim()) {
    const clean = custom.trim().replace(/\/$/, '');
    // Si apunta al frontend estático, migrar automáticamente al backend real
    if (clean.includes('girasolesres.pp.ua')) {
      localStorage.setItem('GIRASOLES_API_BASE', DEFAULT_API_BASE);
      return DEFAULT_API_BASE;
    }
    return clean;
  }
  return DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string): void {
  if (!url || !url.trim()) {
    localStorage.removeItem('GIRASOLES_API_BASE');
  } else {
    localStorage.setItem('GIRASOLES_API_BASE', url.trim().replace(/\/$/, ''));
  }
}

export interface ApiError extends Error {
  status?: number;
  errors?: Record<string, string>;
  detail?: string;
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
    const url = this.formatUrl(endpoint);
    const headers = new Headers(options.headers || {});
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    const authToken = token || localStorage.getItem('GIRASOLES_TOKEN');
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorDetail = `Error ${response.status}: ${response.statusText}`;
        let fieldErrors: Record<string, string> | undefined;

        try {
          const errorJson = await response.json();
          if (errorJson.message) errorDetail = errorJson.message;
          if (errorJson.detail) errorDetail = errorJson.detail;
          if (errorJson.title) errorDetail = errorJson.title;
          if (errorJson.errors) fieldErrors = errorJson.errors;
        } catch {
          // No es JSON, usar texto por defecto
        }

        const err: ApiError = new Error(errorDetail);
        err.status = response.status;
        err.errors = fieldErrors;
        throw err;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const netErr: ApiError = new Error('No se pudo conectar con el servidor de Girasoles. Verifique la conexión de red.');
        netErr.status = 0;
        throw netErr;
      }
      throw err;
    }
  }

  get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  post<T>(endpoint: string, body?: any, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    );
  }

  patch<T>(endpoint: string, body?: any, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
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
