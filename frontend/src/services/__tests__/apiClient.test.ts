import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, validateJwtToken, type ApiClientError } from '../apiClient';

describe('apiClient - Normalización y claridad de errores (RFC 7807 / ProblemDetails)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('extrae el mensaje desde la propiedad detail de RFC 7807 si no existe message', async () => {
    const mockProblemDetails = {
      type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
      title: 'Bad Request',
      status: 400,
      detail: 'El nombre de producto "Ceviche Mixto" ya se encuentra registrado.',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'application/problem+json' : null),
      },
      json: async () => mockProblemDetails,
    } as unknown as Response);

    await expect(apiClient.get('/api/test')).rejects.toThrow(
      'El nombre de producto "Ceviche Mixto" ya se encuentra registrado.'
    );
  });

  it('extrae el primer mensaje de validación desde errors cuando no hay detail ni message', async () => {
    const mockValidationDetails = {
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: {
        precio: ['El precio debe ser mayor a 0 y menor a 999.99'],
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => mockValidationDetails,
    } as unknown as Response);

    try {
      await apiClient.post('/api/test', {});
      expect.unreachable('Debería haber fallado');
    } catch (err: unknown) {
      const apiErr = err as ApiClientError;
      expect(apiErr.message).toBe('El precio debe ser mayor a 0 y menor a 999.99');
      expect(apiErr.status).toBe(400);
      expect(apiErr.errors).toBeDefined();
    }
  });

  it('extrae title si no existe message, detail ni errors', async () => {
    const mockProblem = {
      title: 'Recurso no disponible temporalmente',
      status: 500,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'application/problem+json' : null),
      },
      json: async () => mockProblem,
    } as unknown as Response);

    await expect(apiClient.get('/api/test')).rejects.toThrow('Recurso no disponible temporalmente');
  });

  it('valida tokens JWT correctamente detectando vencidos o malformados', () => {
    expect(validateJwtToken(null).valid).toBe(false);
    expect(validateJwtToken('invalido').valid).toBe(false);

    // Token vencido
    const expiredPayload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 100 }));
    const expiredToken = `eyJhbGciOiJIUzI1NiJ9.${expiredPayload}.sig`;
    expect(validateJwtToken(expiredToken).valid).toBe(false);

    // Token válido en el futuro
    const validPayload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const validToken = `eyJhbGciOiJIUzI1NiJ9.${validPayload}.sig`;
    expect(validateJwtToken(validToken).valid).toBe(true);
  });
});
