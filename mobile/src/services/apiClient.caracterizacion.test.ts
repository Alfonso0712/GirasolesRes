import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as serverConfig from '../config/serverConfig';
import {
  apiClient,
  ApiError,
  DEFAULT_API_BASE,
  descargarArchivo,
  getApiBaseUrl,
  setOnUnauthorizedCallback,
} from './apiClient';

function crearJwtConExp(expSeconds: number): string {
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `hdr.${payload}.sig`;
}

function crearRespuestaJson(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function leerHeader(init: RequestInit | undefined, nombre: string): string | null {
  if (!init?.headers) {
    return null;
  }
  if (init.headers instanceof Headers) {
    return init.headers.get(nombre);
  }
  return new Headers(init.headers).get(nombre);
}

describe('apiClient - pruebas de caracterizacion', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    setOnUnauthorizedCallback(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
    setOnUnauthorizedCallback(null);
    localStorage.clear();
  });

  describe('Exito GET y POST (con y sin envoltorio y 204)', () => {
    it('resuelve GET con payload plano y con envoltorio { success, message, data }', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(crearRespuestaJson(200, [{ id: 1, numero: 5 }]))
        .mockResolvedValueOnce(
          crearRespuestaJson(200, {
            success: true,
            message: 'OK',
            data: { id: 2, nombre: 'Arroz con pollo' },
          })
        );
      globalThis.fetch = fetchMock;

      const plano = await apiClient.get<Array<{ id: number; numero: number }>>('/mesas');
      const envuelto = await apiClient.get<{
        success: boolean;
        message: string;
        data: { id: number; nombre: string };
      }>('/menu-dia/hoy');

      expect(plano).toEqual([{ id: 1, numero: 5 }]);
      expect(envuelto).toEqual({
        success: true,
        message: 'OK',
        data: { id: 2, nombre: 'Arroz con pollo' },
      });
      expect(fetchMock.mock.calls[0][0]).toBe(`${DEFAULT_API_BASE.replace(/\/+$/, '')}/mesas`);
      const init = fetchMock.mock.calls[0][1];
      expect(init?.method).toBe('GET');
      expect(leerHeader(init, 'Accept')).toBe('application/json');
      expect(leerHeader(init, 'Content-Type')).toBe('application/json');
    });

    it('envia POST JSON con y sin envoltorio en respuesta y maneja 204 vacio', async () => {
      localStorage.setItem('GIRASOLES_TOKEN', 'tok-valido');
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(crearRespuestaJson(200, { id: 10, total: 25 }))
        .mockResolvedValueOnce(
          crearRespuestaJson(201, {
            success: true,
            message: 'Registrado',
            data: { pedidoId: 99 },
          })
        )
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
          headers: new Headers(),
          json: async () => {
            throw new Error('no json');
          },
        });
      globalThis.fetch = fetchMock;

      const resPlano = await apiClient.post<{ id: number; total: number }>('/cobros', { monto: 25 });
      const resEnvuelto = await apiClient.post<{
        success: boolean;
        message: string;
        data: { pedidoId: number };
      }>('/pedidos/mesa', { mesaId: 3 });
      const res204 = await apiClient.post<Record<string, never>>('/avisos/7/visto');

      expect(resPlano).toEqual({ id: 10, total: 25 });
      expect(resEnvuelto).toEqual({
        success: true,
        message: 'Registrado',
        data: { pedidoId: 99 },
      });
      expect(res204).toEqual({});
      expect(fetchMock.mock.calls[0][0]).toBe(`${DEFAULT_API_BASE.replace(/\/+$/, '')}/cobros`);
      const init = fetchMock.mock.calls[0][1];
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ monto: 25 }));
      expect(leerHeader(init, 'Authorization')).toBe('Bearer tok-valido');
      expect(leerHeader(init, 'Content-Type')).toBe('application/json');
    });
  });

  describe('Errores HTTP (400, 403, 404, 409, 5xx) y ApiError', () => {
    it.each([
      {
        status: 400,
        body: { message: 'Datos incorrectos', code: 'MSG-01', errors: { campo: ['Requerido'] } },
        esperadoMensaje: 'Datos incorrectos',
        esperadoCodigo: 'BAD_REQUEST',
      },
      {
        status: 403,
        body: { message: 'Permiso denegado' },
        esperadoMensaje: 'No tiene permiso para realizar esta acción.',
        esperadoCodigo: 'FORBIDDEN',
      },
      {
        status: 404,
        body: { detail: 'Pedido no encontrado', code: 'ERR_NOT_FOUND' },
        esperadoMensaje: 'Pedido no encontrado',
        esperadoCodigo: 'BAD_REQUEST',
      },
      {
        status: 409,
        body: { message: 'Conflicto de estado en comanda', code: 'MSG-15' },
        esperadoMensaje: 'Conflicto de estado en comanda',
        esperadoCodigo: 'BAD_REQUEST',
      },
    ])(
      'mapea error HTTP $status conservando propiedades de ApiError',
      async ({ status, body, esperadoMensaje, esperadoCodigo }) => {
        globalThis.fetch = vi.fn().mockResolvedValueOnce(crearRespuestaJson(status, body));

        let capturado: unknown;
        try {
          await apiClient.post('/pedidos', {});
        } catch (err) {
          capturado = err;
        }

        expect(capturado).toBeInstanceOf(ApiError);
        expect(capturado).toBeInstanceOf(Error);
        expect(capturado).toMatchObject({
          name: 'ApiError',
          status,
          mensaje: esperadoMensaje,
          codigo: esperadoCodigo,
          tipo: 'http',
        });
        if ('errors' in body) {
          expect(capturado).toMatchObject({ errors: body.errors });
        }
        if ('detail' in body) {
          expect(capturado).toMatchObject({ detail: body.detail });
        }
      }
    );

    it('mapea error 5xx con mensaje generico seguro y host cuando aplica', async () => {
      vi.spyOn(serverConfig, 'obtenerUrlBase').mockReturnValue('https://api.ejemplo.local/api');
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        crearRespuestaJson(500, {
          message: 'Stack trace interno',
          code: 'ERR_INTERNAL',
          detail: 'SQL exception',
        })
      );

      let capturado: unknown;
      try {
        await apiClient.post('/caja/abrir', { montoInicial: 100 });
      } catch (err) {
        capturado = err;
      }

      expect(capturado).toBeInstanceOf(ApiError);
      expect(capturado).toMatchObject({
        name: 'ApiError',
        status: 500,
        mensaje: 'Ocurrió un error en el servidor. Intente nuevamente más tarde.',
        codigo: 'SERVER_ERROR',
        detail: 'SQL exception',
        tipo: 'http',
        host: 'api.ejemplo.local',
      });
    });
  });

  describe('Manejo de 401 (sin autorizacion)', () => {
    it('dispara callback, evento girasoles:unauthorized, limpia sesion/token y no intenta renovar', async () => {
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem('GIRASOLES_TOKEN', crearJwtConExp(now + 120));
      localStorage.setItem('GIRASOLES_SESSION', JSON.stringify({ usuario: 'mozo1' }));

      const onUnauthorized = vi.fn();
      setOnUnauthorizedCallback(onUnauthorized);
      const eventoHandler = vi.fn();
      window.addEventListener('girasoles:unauthorized', eventoHandler);

      const fetchMock = vi.fn().mockResolvedValueOnce(
        crearRespuestaJson(401, { message: 'Credenciales invalidas o expiradas' })
      );
      globalThis.fetch = fetchMock;

      let capturado: unknown;
      try {
        await apiClient.post('/auth/login', { usuario: 'u', contrasena: 'p' });
      } catch (err) {
        capturado = err;
      } finally {
        window.removeEventListener('girasoles:unauthorized', eventoHandler);
      }

      expect(capturado).toBeInstanceOf(ApiError);
      expect(capturado).toMatchObject({
        name: 'ApiError',
        status: 401,
        tipo: 'http',
        mensaje: 'Sesión expirada. Inicie sesión nuevamente.',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(eventoHandler).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('GIRASOLES_TOKEN')).toBeNull();
      expect(localStorage.getItem('GIRASOLES_SESSION')).toBeNull();
    });

    it('401 en peticion GET no ejecuta reintentos ni bucle de renovacion', async () => {
      const onUnauthorized = vi.fn();
      setOnUnauthorizedCallback(onUnauthorized);
      localStorage.setItem('GIRASOLES_TOKEN', 'tok-expirado');
      localStorage.setItem('GIRASOLES_SESSION', '{}');

      const fetchMock = vi.fn().mockResolvedValue(crearRespuestaJson(401, {}));
      globalThis.fetch = fetchMock;

      await expect(apiClient.get('/perfil')).rejects.toMatchObject({
        status: 401,
        mensaje: 'Sesión expirada. Inicie sesión nuevamente.',
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('GIRASOLES_TOKEN')).toBeNull();
    });
  });

  describe('Timeout (15 s request, 30 s descarga) y errores de red', () => {
    it('aborta request POST a los 15 segundos con ApiError timeout', async () => {
      vi.useFakeTimers();
      vi.spyOn(serverConfig, 'obtenerUrlBase').mockReturnValue('https://api.ejemplo.local/api');

      const fetchMock = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const abortErr = new Error('The operation was aborted');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        });
      });
      globalThis.fetch = fetchMock;

      const promesa = apiClient.post('/pedidos/mesa', { mesaId: 1 });
      const rechazo = expect(promesa).rejects.toMatchObject({
        name: 'ApiError',
        status: 0,
        codigo: 'ERR_TIMEOUT',
        tipo: 'timeout',
        host: 'api.ejemplo.local',
      });

      await vi.advanceTimersByTimeAsync(15000);
      await rechazo;
    });

    it('aborta descargarArchivo a los 30 segundos con ApiError timeout especifico', async () => {
      vi.useFakeTimers();
      vi.spyOn(serverConfig, 'obtenerUrlBase').mockReturnValue('https://api.ejemplo.local/api');

      const fetchMock = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const abortErr = new Error('Aborted');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        });
      });
      globalThis.fetch = fetchMock;

      const promesa = descargarArchivo('/reportes/ventas/exportar');
      const rechazo = expect(promesa).rejects.toMatchObject({
        name: 'ApiError',
        status: 0,
        codigo: 'ERR_TIMEOUT',
        tipo: 'timeout',
        mensaje: 'La descarga tardó demasiado. Verifique su conexión.',
        host: 'api.ejemplo.local',
      });

      await vi.advanceTimersByTimeAsync(29999);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      await rechazo;
    });

    it('mapea TypeError de red a ApiError sin-respuesta con ERR_CONEXION', async () => {
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiClient.post('/caja/cerrar', {})).rejects.toMatchObject({
        name: 'ApiError',
        status: 0,
        codigo: 'ERR_CONEXION',
        tipo: 'sin-respuesta',
        mensaje: 'No se pudo conectar con el servidor. Verifique su conexión.',
      });
    });
  });

  describe('Reintentos exponenciales solo en GET', () => {
    it('reintenta GET con demoras de 1, 2 y 4 s (maximo 3 reintentos = 4 intentos) y tiene exito en el cuarto', async () => {
      vi.useFakeTimers();
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(crearRespuestaJson(200, { ok: true }));
      globalThis.fetch = fetchMock;

      const promesa = apiClient.get<{ ok: boolean }>('/mesas');

      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      await expect(promesa).resolves.toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(4);

      const delays = setTimeoutSpy.mock.calls.map((c) => c[1]).filter((d) => d === 1000 || d === 2000 || d === 4000);
      expect(delays).toEqual([1000, 2000, 4000]);
    });

    it('falla tras agotar los 3 reintentos de GET (4 intentos totales)', async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      globalThis.fetch = fetchMock;

      const promesa = apiClient.get('/mesas');
      const rechazo = expect(promesa).rejects.toMatchObject({
        name: 'ApiError',
        codigo: 'ERR_CONEXION',
        tipo: 'sin-respuesta',
      });

      await vi.advanceTimersByTimeAsync(1000 + 2000 + 4000);
      await rechazo;
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it.each(['post', 'put', 'patch', 'delete'] as const)(
      'no reintenta metodo %s ante error de red',
      async (metodo) => {
        const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
        globalThis.fetch = fetchMock;

        await expect(
          metodo === 'delete' ? apiClient.delete('/mesas/1') : apiClient[metodo]('/mesas/1', { nombre: 'M1' })
        ).rejects.toMatchObject({ codigo: 'ERR_CONEXION' });

        expect(fetchMock).toHaveBeenCalledTimes(1);
      }
    );

    it('descargarArchivo no reintenta ante error de red', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      globalThis.fetch = fetchMock;

      await expect(descargarArchivo('/caja/cierres/1/pdf')).rejects.toMatchObject({
        codigo: 'ERR_CONEXION',
        tipo: 'sin-respuesta',
        mensaje: 'No se pudo conectar con el servidor para descargar el archivo.',
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Renovacion preventiva de token y deduplicacion', () => {
    it('renueva preventivamente cuando exp < 300s y deduplica dos peticiones concurrentes', async () => {
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem('GIRASOLES_TOKEN', crearJwtConExp(now + 150));

      let resolverRenovacion: ((res: Response) => void) | undefined;
      const promesaRenovacion = new Promise<Response>((resolve) => {
        resolverRenovacion = resolve;
      });

      const fetchMock = vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/auth/renovar')) {
          return promesaRenovacion;
        }
        return Promise.resolve(crearRespuestaJson(200, { ok: true, url }));
      });
      globalThis.fetch = fetchMock;

      const p1 = apiClient.get<{ ok: boolean }>('/mesas');
      const p2 = apiClient.get<{ ok: boolean }>('/avisos');

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      resolverRenovacion?.(crearRespuestaJson(200, { token: 'token-renovado-unico' }));

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toMatchObject({ ok: true });
      expect(r2).toMatchObject({ ok: true });

      const llamadasRenovar = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/renovar'));
      expect(llamadasRenovar).toHaveLength(1);
      expect(localStorage.getItem('GIRASOLES_TOKEN')).toBe('token-renovado-unico');
    });

    it.each(['/auth/login', '/auth/logout', '/auth/renovar'])(
      'no intenta renovar preventivamente en endpoint %s',
      async (ruta) => {
        const now = Math.floor(Date.now() / 1000);
        localStorage.setItem('GIRASOLES_TOKEN', crearJwtConExp(now + 60));

        const fetchMock = vi.fn().mockResolvedValueOnce(crearRespuestaJson(200, { ok: true }));
        globalThis.fetch = fetchMock;

        await apiClient.post(ruta, {});

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0][0])).toContain(ruta);
      }
    );

    it('continua con el token actual si la renovacion preventiva falla', async () => {
      const now = Math.floor(Date.now() / 1000);
      const tokenOriginal = crearJwtConExp(now + 90);
      localStorage.setItem('GIRASOLES_TOKEN', tokenOriginal);

      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fallo temporal de renovacion'))
        .mockResolvedValueOnce(crearRespuestaJson(200, { datos: 123 }));
      globalThis.fetch = fetchMock;

      const res = await apiClient.post<{ datos: number }>('/pedidos/mesa', { mesaId: 2 });

      expect(res).toEqual({ datos: 123 });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(leerHeader(fetchMock.mock.calls[1][1], 'Authorization')).toBe(`Bearer ${tokenOriginal}`);
    });
  });

  describe('descargarArchivo y resolucion dinamica de URL', () => {
    it('descargarArchivo construye query params validos, envia Accept binario y devuelve Blob', async () => {
      const blobEsperado = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        blob: async () => blobEsperado,
      });
      globalThis.fetch = fetchMock;

      const blob = await descargarArchivo(
        '/reportes/ventas/exportar',
        { desde: '2026-01-01', hasta: ' ', ignorar: undefined, nulo: null, limite: 50 },
        'tok-manual'
      );

      expect(blob).toBe(blobEsperado);
      expect(fetchMock.mock.calls[0][0]).toBe(
        `${DEFAULT_API_BASE.replace(/\/+$/, '')}/reportes/ventas/exportar?desde=2026-01-01&limite=50`
      );
      const init = fetchMock.mock.calls[0][1];
      expect(init?.method).toBe('GET');
      expect(leerHeader(init, 'Accept')).toBe('application/pdf, application/octet-stream, */*');
      expect(leerHeader(init, 'Authorization')).toBe('Bearer tok-manual');
    });

    it('descargarArchivo aplica los mismos errores HTTP (404, 5xx) y 401', async () => {
      const onUnauthorized = vi.fn();
      setOnUnauthorizedCallback(onUnauthorized);
      localStorage.setItem('GIRASOLES_TOKEN', 'tok');

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(crearRespuestaJson(404, { detail: 'Ticket inexistente' }))
        .mockResolvedValueOnce(crearRespuestaJson(502, {}))
        .mockResolvedValueOnce(crearRespuestaJson(401, {}));
      globalThis.fetch = fetchMock;

      await expect(descargarArchivo('/ventas/1/ticket')).rejects.toMatchObject({
        status: 404,
        mensaje: 'Ticket inexistente',
        tipo: 'http',
      });

      await expect(descargarArchivo('/ventas/1/ticket')).rejects.toMatchObject({
        status: 502,
        mensaje: 'Ocurrió un error al generar el archivo en el servidor.',
        tipo: 'http',
      });

      await expect(descargarArchivo('/ventas/1/ticket')).rejects.toMatchObject({
        status: 401,
        tipo: 'http',
      });
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('GIRASOLES_TOKEN')).toBeNull();
    });

    it('resuelve obtenerUrlBase() en cada peticion ante cambio dinamico entre llamadas', async () => {
      vi.spyOn(serverConfig, 'obtenerUrlBase')
        .mockReturnValueOnce('https://servidor-a.test/api')
        .mockReturnValueOnce('https://servidor-b.test/api')
        .mockReturnValueOnce('https://servidor-b.test/api')
        .mockReturnValueOnce('https://servidor-c.test/api');

      const blobEsperado = new Blob(['ok']);
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(crearRespuestaJson(200, { step: 1 }))
        .mockResolvedValueOnce(crearRespuestaJson(200, { step: 2 }))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          blob: async () => blobEsperado,
        });
      globalThis.fetch = fetchMock;

      await apiClient.post('/mesas', {});
      expect(getApiBaseUrl()).toBe('https://servidor-b.test/api');
      await apiClient.post('/mesas', {});
      await descargarArchivo('/caja/cierres/1/pdf');

      expect(fetchMock.mock.calls[0][0]).toBe('https://servidor-a.test/api/mesas');
      expect(fetchMock.mock.calls[1][0]).toBe('https://servidor-b.test/api/mesas');
      expect(fetchMock.mock.calls[2][0]).toBe('https://servidor-c.test/api/caja/cierres/1/pdf');
    });
  });
});
