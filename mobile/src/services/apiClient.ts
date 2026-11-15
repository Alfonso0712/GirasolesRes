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
  agregarQueryParams,
  construirCabecerasBinario,
  construirCabecerasJson,
  extraerHost,
  formatearUrl,
} from './http/construirPeticion';
import { ApiError } from './http/errorHttp';
import type { ApiErrorTipo, OpcionesApiError } from './http/errorHttp';
import { manejarNoAutorizado, setOnUnauthorizedCallback } from './http/noAutorizado';
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
          manejarNoAutorizado();
          throw new ApiError({
            status: 401,
            mensaje: 'Sesión expirada. Inicie sesión nuevamente.',
            codigo: codigo || 'UNAUTHORIZED',
            errors: fieldErrors,
            detail: errorDetail,
            tipo: 'http',
            host: requestHost,
          });
        }

        if (response.status === 403) {
          throw new ApiError({
            status: 403,
            mensaje: 'No tiene permiso para realizar esta acción.',
            codigo: codigo || 'FORBIDDEN',
            errors: fieldErrors,
            detail: errorDetail,
            tipo: 'http',
            host: requestHost,
          });
        }

        if (response.status >= 500) {
          throw new ApiError({
            status: response.status,
            mensaje: 'Ocurrió un error en el servidor. Intente nuevamente más tarde.',
            codigo: codigo || 'SERVER_ERROR',
            errors: fieldErrors,
            detail: errorDetail,
            tipo: 'http',
            host: requestHost,
          });
        }

        const mensajeCliente =
          backendMsg || 'Solicitud inválida. Verifique los datos ingresados.';

        throw new ApiError({
          status: response.status,
          mensaje: mensajeCliente,
          codigo: codigo || 'BAD_REQUEST',
          errors: fieldErrors,
          detail: errorDetail,
          tipo: 'http',
          host: requestHost,
        });
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

      if (err instanceof ApiError) {
        throw err;
      }

      if (
        (err instanceof Error && err.name === 'AbortError') ||
        controller.signal.aborted
      ) {
        throw new ApiError({
          status: 0,
          mensaje: 'No se pudo conectar con el servidor. Verifique su conexión.',
          codigo: 'ERR_TIMEOUT',
          tipo: 'timeout',
          host: requestHost,
        });
      }

      if (
        err instanceof Error &&
        (err.name === 'TypeError' || err.message.toLowerCase().includes('fetch'))
      ) {
        throw new ApiError({
          status: 0,
          mensaje: 'No se pudo conectar con el servidor. Verifique su conexión.',
          codigo: 'ERR_CONEXION',
          tipo: 'sin-respuesta',
          host: requestHost,
        });
      }

      throw new ApiError({
        status: 0,
        mensaje: 'No se pudo conectar con el servidor. Verifique su conexión.',
        codigo: 'ERR_DESCONOCIDO',
        tipo: 'sin-respuesta',
        host: requestHost,
      });
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
          // La respuesta de error no es JSON
        }

        if (response.status === 401) {
          manejarNoAutorizado();
          throw new ApiError({
            status: 401,
            mensaje: 'Sesión expirada. Inicie sesión nuevamente.',
            codigo: codigo || 'UNAUTHORIZED',
            errors: fieldErrors,
            detail: errorDetail,
            tipo: 'http',
            host: requestHost,
          });
        }

        if (response.status === 403) {
          throw new ApiError({
            status: 403,
            mensaje: 'No tiene permiso para realizar esta acción.',
            codigo: codigo || 'FORBIDDEN',
            errors: fieldErrors,
            detail: errorDetail,
            tipo: 'http',
            host: requestHost,
          });
        }

        if (response.status >= 500) {
          throw new ApiError({
            status: response.status,
            mensaje: backendMsg || 'Ocurrió un error al generar el archivo en el servidor.',
            codigo: codigo || 'SERVER_ERROR',
            errors: fieldErrors,
            detail: errorDetail,
            tipo: 'http',
            host: requestHost,
          });
        }

        throw new ApiError({
          status: response.status,
          mensaje: backendMsg || 'No se pudo descargar el documento solicitado.',
          codigo: codigo || 'BAD_REQUEST',
          errors: fieldErrors,
          detail: errorDetail,
          tipo: 'http',
          host: requestHost,
        });
      }

      return await response.blob();
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('girasoles:network-error', { detail: err }));
      }

      if (err instanceof ApiError) {
        throw err;
      }

      if (
        (err instanceof Error && err.name === 'AbortError') ||
        controller.signal.aborted
      ) {
        throw new ApiError({
          status: 0,
          mensaje: 'La descarga tardó demasiado. Verifique su conexión.',
          codigo: 'ERR_TIMEOUT',
          tipo: 'timeout',
          host: requestHost,
        });
      }

      throw new ApiError({
        status: 0,
        mensaje: 'No se pudo conectar con el servidor para descargar el archivo.',
        codigo: 'ERR_CONEXION',
        tipo: 'sin-respuesta',
        host: requestHost,
      });
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
