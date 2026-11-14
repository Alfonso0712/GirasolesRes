import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  apiClient,
  ApiError,
  setOnUnauthorizedCallback,
  getApiBaseUrl,
  setApiBaseUrl,
} from './apiClient';
import { URL_API_POR_DEFECTO } from '../config/serverConfig';

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    setOnUnauthorizedCallback(null);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('ApiError', () => {
    it('debe construir correctamente un error con sus propiedades', () => {
      const err = new ApiError(
        400,
        'Monto inválido',
        'MSG-170',
        { monto: 'El monto excede el límite' },
        'Detalle adicional',
        'http',
        'api.servidor.com'
      );

      expect(err.name).toBe('ApiError');
      expect(err.status).toBe(400);
      expect(err.mensaje).toBe('Monto inválido');
      expect(err.codigo).toBe('MSG-170');
      expect(err.errors).toEqual({ monto: 'El monto excede el límite' });
      expect(err.detail).toBe('Detalle adicional');
      expect(err.tipo).toBe('http');
      expect(err.host).toBe('api.servidor.com');
    });
  });

  describe('getApiBaseUrl y setApiBaseUrl', () => {
    it('debe retornar la URL oficial por defecto inicialmente', () => {
      expect(getApiBaseUrl()).toBe(URL_API_POR_DEFECTO.replace(/\/+$/, ''));
    });

    it('debe restablecer a la URL por defecto cuando se pasa una cadena vacía', () => {
      setApiBaseUrl('');
      expect(getApiBaseUrl()).toBe(URL_API_POR_DEFECTO.replace(/\/+$/, ''));
    });
  });

  describe('Mapeo de errores y códigos HTTP', () => {
    it('debe mapear respuestas JSON con código de error y mensaje de negocio', async () => {
      const mockResponse = {
        mensaje: 'No se puede cerrar la caja con pedidos pendientes.',
        codigo: 'MSG-174',
        errors: { pedidos: ['Hay 2 pedidos sin pagar'] },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockResponse,
      });

      await expect(apiClient.get('/caja/cerrar')).rejects.toMatchObject({
        name: 'ApiError',
        status: 400,
        mensaje: 'No se puede cerrar la caja con pedidos pendientes.',
        codigo: 'MSG-174',
      });
    });

    it('debe manejar respuestas no JSON con mensaje predeterminado', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Bad gateway HTML');
        },
      });

      await expect(apiClient.get('/mesas')).rejects.toMatchObject({
        name: 'ApiError',
        status: 502,
        mensaje: 'Ocurrió un error en el servidor. Intente nuevamente más tarde.',
      });
    });
  });

  describe('Manejo de 401 Unauthorized', () => {
    it('debe borrar tokens de sesión y disparar callback al recibir 401', async () => {
      localStorage.setItem('GIRASOLES_TOKEN', 'token-vencido');
      localStorage.setItem('GIRASOLES_SESSION', JSON.stringify({ nombre: 'Juan' }));

      const callbackUnauthorized = vi.fn();
      setOnUnauthorizedCallback(callbackUnauthorized);

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ mensaje: 'Sesión expirada' }),
      });

      await expect(apiClient.get('/perfil')).rejects.toThrow();

      expect(localStorage.getItem('GIRASOLES_TOKEN')).toBeNull();
      expect(localStorage.getItem('GIRASOLES_SESSION')).toBeNull();
      expect(callbackUnauthorized).toHaveBeenCalledTimes(1);
    });
  });

  describe('Renovación preventiva de token JWT', () => {
    it('debe intentar renovar el token si expira en menos de 300 segundos', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expPronto = nowSeconds + 120; // expira en 2 minutos (< 5 min)

      // Payload base64Url con exp
      const payload = btoa(JSON.stringify({ exp: expPronto }))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      const tokenProntoAVencer = `header.${payload}.signature`;

      localStorage.setItem('GIRASOLES_TOKEN', tokenProntoAVencer);

      const fetchMock = vi.fn();

      // Primera llamada: renovación POST /auth/renovar
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'nuevo-token-fresco' }),
      });

      // Segunda llamada: la petición real solicitada
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exito: true }),
      });

      globalThis.fetch = fetchMock;

      const resultado = await apiClient.get<{ exito: boolean }>('/pedidos');

      expect(resultado).toEqual({ exito: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(localStorage.getItem('GIRASOLES_TOKEN')).toBe('nuevo-token-fresco');
    });
  });
});
