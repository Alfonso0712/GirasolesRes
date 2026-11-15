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

import {
  lanzarErrorHttp,
  normalizarErrorCatch,
  PERFIL_ERROR_BINARIO,
  PERFIL_ERROR_JSON,
} from './http/clasificarFallo';
import {
  agregarQueryParams,
  construirCabecerasBinario,
  construirCabecerasJson,
  extraerHost,
  formatearUrl,
} from './http/construirPeticion';
import { ApiError } from './http/errorHttp';
import type { ApiErrorTipo, OpcionesApiError } from './http/errorHttp';
import { setOnUnauthorizedCallback } from './http/noAutorizado';
import { ejecutarConReintentos } from './http/reintentos';
import { esRutaAuthEspecial, resolverTokenPeticion } from './http/renovacionToken';

export { ApiError, setOnUnauthorizedCallback };
export type { ApiErrorTipo, OpcionesApiError };

// Manejo centralizado de 401 delegado a ./http/noAutorizado

// Renovación preventiva de token delegada a ./http/renovacionToken

// Reintentos exponenciales delegados a ./http/reintentos

class ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    const authToken = await resolverTokenPeticion(token, esRutaAuthEspecial(endpoint));

    const url = formatearUrl(endpoint);
    const requestHost = extraerHost(url);
    const headers = construirCabecerasJson(options.headers, options.body, authToken);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('girasoles:network-success'));
      }

      if (!response.ok) {
        return await lanzarErrorHttp(response, requestHost, PERFIL_ERROR_JSON);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('girasoles:network-error', { detail: err }));
      }

      return normalizarErrorCatch(err, controller.signal.aborted, requestHost, PERFIL_ERROR_JSON);
    }
  }

  get<T>(endpoint: string, token?: string): Promise<T> {
    return ejecutarConReintentos(() => this.request<T>(endpoint, { method: 'GET' }, token), 3);
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
    const endpointFinal = agregarQueryParams(ruta, params);
    const url = formatearUrl(endpointFinal);
    const requestHost = extraerHost(url);
    const headers = construirCabecerasBinario(authToken);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('girasoles:network-success'));
      }

      if (!response.ok) {
        return await lanzarErrorHttp(response, requestHost, PERFIL_ERROR_BINARIO);
      }

      return await response.blob();
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('girasoles:network-error', { detail: err }));
      }

      return normalizarErrorCatch(err, controller.signal.aborted, requestHost, PERFIL_ERROR_BINARIO);
    }
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
