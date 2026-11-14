import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sonSonidosKdsHabilitados,
  reproducirSonidoKds,
  desbloquearAudioKds,
} from './audioKds';

describe('audioKds - Sintetizador Web Audio KDS', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe indicar si los sonidos están habilitados por defecto o según localStorage', () => {
    expect(sonSonidosKdsHabilitados()).toBe(true);

    localStorage.setItem('kds_sonido_activado', 'false');
    expect(sonSonidosKdsHabilitados()).toBe(false);

    localStorage.setItem('kds_sonido_activado', 'true');
    expect(sonSonidosKdsHabilitados()).toBe(true);
  });

  it('no debe reproducir si activado es false o volumenRatio <= 0', () => {
    const mockAudioContext = vi.fn();
    window.AudioContext = mockAudioContext as unknown as typeof AudioContext;

    reproducirSonidoKds('pendiente', false);
    reproducirSonidoKds('pendiente', true, 0);

    expect(mockAudioContext).not.toHaveBeenCalled();
  });

  it('debe sintetizar notas para pendiente, preparacion y lista cuando AudioContext está disponible', () => {
    const setValueAtTime = vi.fn();
    const exponentialRampToValueAtTime = vi.fn();
    const linearRampToValueAtTime = vi.fn();
    const connect = vi.fn();
    const start = vi.fn();
    const stop = vi.fn();
    const resume = vi.fn().mockResolvedValue(undefined);

    const mockCtx = {
      state: 'suspended',
      currentTime: 10,
      resume,
      createOscillator: vi.fn(() => ({
        type: 'sine',
        frequency: { setValueAtTime, exponentialRampToValueAtTime, linearRampToValueAtTime },
        connect,
        start,
        stop,
      })),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime, exponentialRampToValueAtTime, linearRampToValueAtTime },
        connect,
      })),
      destination: {},
    };

    class MockAudioContext {
      constructor() {
        return mockCtx;
      }
    }

    window.AudioContext = MockAudioContext as unknown as typeof AudioContext;

    desbloquearAudioKds();
    expect(resume).toHaveBeenCalled();

    // Evento pendiente
    reproducirSonidoKds('pendiente', true, 1.0);
    expect(mockCtx.createOscillator).toHaveBeenCalled();

    // Evento preparacion
    reproducirSonidoKds('preparacion', true, 1.0);

    // Evento lista
    reproducirSonidoKds('lista', true, 1.0);

    expect(start).toHaveBeenCalled();
  });
});
