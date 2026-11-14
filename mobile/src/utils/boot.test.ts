import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('boot - Pantalla de arranque de la aplicación', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('debe ocultar y remover el elemento #boot transcurrido el tiempo mínimo', async () => {
    const bootDiv = document.createElement('div');
    bootDiv.id = 'boot';
    document.body.appendChild(bootDiv);

    const { markAppReady } = await import('./boot');
    markAppReady();

    // Avanza el tiempo restante mínimo (600ms) + fadeOut (250ms)
    vi.advanceTimersByTime(650);
    expect(bootDiv.style.opacity).toBe('0');

    vi.advanceTimersByTime(300);
    expect(document.getElementById('boot')).toBeNull();
  });

  it('debe manejar suavemente cuando el elemento #boot no existe en el DOM', async () => {
    const { markAppReady } = await import('./boot');
    expect(() => markAppReady()).not.toThrow();
  });
});
