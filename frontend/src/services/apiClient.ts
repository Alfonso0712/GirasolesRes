/**
 * Cliente HTTP base centralizado (Clean Frontend Architecture).
 * Encapsula la configuración de cabeceras, serialización JSON,
 * adjunción de tokens JWT y mapeo homogéneo de errores HTTP (incluyendo 401).
 */

export interface ApiClientError extends Error {
  status?: number;
  errors?: Record<string, string>;
  field?: string;
  detail?: string;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...restOptions,
    headers,
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok || (responseBody && responseBody.success === false)) {
    const defaultMsg = response.status === 401
      ? 'Su sesión expiró. Ingrese nuevamente.'
      : 'Error de comunicación con el servidor.';

    const err: ApiClientError = new Error(responseBody.message || defaultMsg);
    err.status = response.status;
    err.field = responseBody.field;
    err.errors = responseBody.errors;
    err.detail = responseBody.detail;
    throw err;
  }

  return responseBody as T;
}

export const apiClient = {
  get: <T>(endpoint: string, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body?: any, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'POST', body, token }),

  put: <T>(endpoint: string, body?: any, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'PUT', body, token }),

  patch: <T>(endpoint: string, body?: any, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'PATCH', body, token }),

  delete: <T>(endpoint: string, token?: string): Promise<T> =>
    request<T>(endpoint, { method: 'DELETE', token }),
};
