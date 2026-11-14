import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  normalizarUrl,
  leerUrlGuardada,
  guardarUrl,
  restablecerUrl,
  obtenerUrlBase,
  HOSTS_BLOQUEADOS,
  STORAGE_KEY_API_BASE,
  URL_API_POR_DEFECTO,
  probarConexion,
  consumirMensajeRestablecimiento,
} from './serverConfig';

describe('serverConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('normalizarUrl', () => {
    it('debe rechazar cadenas vacías o compuestas solo por espacios', () => {
      const res = normalizarUrl('   ');
      expect(res.error).toBe('Ingrese una dirección de servidor válida.');
      expect(res.url).toBe('');
      expect(res.esBloqueado).toBe(false);
    });

    it('debe exigir protocolo http:// o https://', () => {
      const res = normalizarUrl('girasoles.astrazynk.pp.ua/api');
      expect(res.error).toBe('La dirección debe comenzar con http:// o https://');
      expect(res.url).toBe('');
    });

    it('debe normalizar agregando /api si la URL no incluye una ruta específica', () => {
      const res = normalizarUrl('https://mi-servidor.local');
      expect(res.error).toBeUndefined();
      expect(res.url).toBe('https://mi-servidor.local/api');
      expect(res.host).toBe('mi-servidor.local');
      expect(res.esInsegura).toBe(false);
    });

    it('debe respetar rutas existentes y quitar barras finales', () => {
      const res = normalizarUrl('https://servidor.com/api///');
      expect(res.url).toBe('https://servidor.com/api');
      expect(res.error).toBeUndefined();
    });

    it('debe marcar esInsegura para URLs http://', () => {
      const res = normalizarUrl('http://192.168.1.100:5000/api');
      expect(res.esInsegura).toBe(true);
      expect(res.url).toBe('http://192.168.1.100:5000/api');
    });

    it('debe bloquear terminantemente los hosts del sitio web institucional', () => {
      HOSTS_BLOQUEADOS.forEach((hostBloqueado) => {
        const res = normalizarUrl(`https://${hostBloqueado}`);
        expect(res.esBloqueado).toBe(true);
        expect(res.error).toContain('sitio web de Girasoles, no la API');
      });

      // Subdominios de hosts bloqueados
      const subRes = normalizarUrl('https://sub.girasolesres.pp.ua');
      expect(subRes.esBloqueado).toBe(true);
    });
  });

  describe('guardarUrl y restablecerUrl', () => {
    it('debe guardar la URL normalizada en localStorage si es válida', () => {
      const res = guardarUrl('https://demo.servidor.com/api');
      expect(res.ok).toBe(true);
      expect(res.url).toBe('https://demo.servidor.com/api');
      expect(leerUrlGuardada()).toBe('https://demo.servidor.com/api');
    });

    it('no debe guardar URLs que pertenezcan a hosts bloqueados o inválidas', () => {
      const res = guardarUrl('https://girasolesres.pp.ua');
      expect(res.ok).toBe(false);
      expect(res.error).toBeDefined();
      expect(leerUrlGuardada()).toBeNull();
    });

    it('debe eliminar la clave al restablecerUrl', () => {
      localStorage.setItem(STORAGE_KEY_API_BASE, 'https://algun-host.com/api');
      restablecerUrl();
      expect(localStorage.getItem(STORAGE_KEY_API_BASE)).toBeNull();
    });
  });

  describe('obtenerUrlBase', () => {
    it('debe retornar la URL por defecto cuando no hay ninguna guardada', () => {
      const url = obtenerUrlBase();
      expect(url).toBe(URL_API_POR_DEFECTO.replace(/\/+$/, ''));
    });

    it('debe descartar y restablecer la URL guardada si es inválida o bloqueada', () => {
      localStorage.setItem(STORAGE_KEY_API_BASE, 'https://girasolesres.pp.ua');
      const url = obtenerUrlBase();
      expect(url).toBe(URL_API_POR_DEFECTO.replace(/\/+$/, ''));
      expect(localStorage.getItem(STORAGE_KEY_API_BASE)).toBeNull();
      expect(consumirMensajeRestablecimiento()).toContain('Se restableció la dirección del servidor');
    });
  });

  describe('probarConexion', () => {
    it('debe rechazar de inmediato hosts bloqueados', async () => {
      const res = await probarConexion('https://girasolesres.pp.ua');
      expect(res.exito).toBe(false);
      expect(res.mensaje).toContain('sitio web de Girasoles, no la API');
    });

    it('debe rechazar URLs con formato inválido', async () => {
      const res = await probarConexion('sin-protocolo.com');
      expect(res.exito).toBe(false);
      expect(res.tipo).toBe('error');
    });

    it('debe considerar éxito cuando el endpoint /auth/me responde 401 JSON (API viva)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ mensaje: 'No autenticado' }),
      });

      const res = await probarConexion(URL_API_POR_DEFECTO);
      expect(res.exito).toBe(true);
      expect(res.tipo).toBe('exito');
      expect(res.mensaje).toContain('Conexión correcta');
    });

    it('debe rechazar si el servidor responde con una página HTML en lugar de API', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html><body>Sitio Web</body></html>',
      });

      const res = await probarConexion('https://mi-web.com/api');
      expect(res.exito).toBe(false);
      expect(res.mensaje).toContain('sitio web');
    });

    it('debe capturar errores de red o servidor inalcanzable', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

      const res = await probarConexion('https://servidor-caido.local/api');
      expect(res.exito).toBe(false);
      expect(res.mensaje).toContain('No se pudo conectar con el servidor');
    });
  });
});
