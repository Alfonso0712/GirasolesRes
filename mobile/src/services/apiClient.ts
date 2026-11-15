// MÓDULO PROTEGIDO: conexión y modo demostración. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

/**
 * Cliente HTTP base para la aplicación móvil de Restaurante Girasoles.
 * Configuración centralizada, timeout de 15s con AbortController,
 * manejo normalizado de errores (ApiError) y renovación preventiva de token JWT.
 */

import {
  URL_API_POR_DEFECTO,
  obtenerUrlBase,
  guardarUrl,
  restablecerUrl,
} from '../config/serverConfig';

export const DEFAULT_API_BASE: string = URL_API_POR_DEFECTO;

export function getApiBaseUrl(): string {
  return obtenerUrlBase();
}

export function setApiBaseUrl(url: string): void {
  if (!url || !url.trim()) {
    restablecerUrl();
  } else {
    guardarUrl(url);
  }
}

import { PERFIL_ERROR_BINARIO, PERFIL_ERROR_JSON } from './http/clasificarFallo';
import {
  agregarQueryParams,
  construirCabecerasBinario,
  construirCabecerasJson,
  extraerHost,
  formatearUrl,
} from './http/construirPeticion';
import { ejecutarPeticionHttp } from './http/ejecutarConTimeout';
import { ApiError } from './http/errorHttp';
import type { ApiErrorTipo, OpcionesApiError } from './http/errorHttp';
import { setOnUnauthorizedCallback } from './http/noAutorizado';
import { ejecutarConReintentos } from './http/reintentos';
import { esRutaAuthEspecial, resolverTokenPeticion } from './http/renovacionToken';

export { ApiError, setOnUnauthorizedCallback };
export type { ApiErrorTipo, OpcionesApiError };

async function interpretarJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }
  return (await response.json()) as T;
}

class ApiClient {
  private enviarConCuerpo<T>(
    method: 'POST' | 'PATCH' | 'PUT',
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method,
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    );
  }

  async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    const authToken = await resolverTokenPeticion(token, esRutaAuthEspecial(endpoint));
    const url = formatearUrl(endpoint);
    const headers = construirCabecerasJson(options.headers, options.body, authToken);

    return ejecutarPeticionHttp<T>({
      url,
      init: { ...options, headers },
      timeoutMs: 15000,
      host: extraerHost(url),
      perfilError: PERFIL_ERROR_JSON,
      interpretar: interpretarJson,
    });
  }

  get<T>(endpoint: string, token?: string): Promise<T> {
    return ejecutarConReintentos(() => this.request<T>(endpoint, { method: 'GET' }, token), 3);
  }

  post<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.enviarConCuerpo<T>('POST', endpoint, body, token);
  }

  patch<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.enviarConCuerpo<T>('PATCH', endpoint, body, token);
  }

  put<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.enviarConCuerpo<T>('PUT', endpoint, body, token);
  }

  delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }

  /**
   * Descarga un archivo binario (ej. PDF) con el token de autorización actual,
   * errores normalizados (ApiError) y tiempo de espera de 30 segundos.
   */
  async descargarArchivo(
    ruta: string,
    params?: Record<string, string | number | undefined | null>,
    token?: string
  ): Promise<Blob> {
    const authToken = await resolverTokenPeticion(token);
    const url = formatearUrl(agregarQueryParams(ruta, params));

    return ejecutarPeticionHttp<Blob>({
      url,
      init: {
        method: 'GET',
        headers: construirCabecerasBinario(authToken),
      },
      timeoutMs: 30000,
      host: extraerHost(url),
      perfilError: PERFIL_ERROR_BINARIO,
      interpretar: (response) => response.blob(),
    });
  }
}

export const apiClient = new ApiClient();

export function descargarArchivo(
  ruta: string,
  params?: Record<string, string | number | undefined | null>,
  token?: string
): Promise<Blob> {
  return apiClient.descargarArchivo(ruta, params, token);
}
