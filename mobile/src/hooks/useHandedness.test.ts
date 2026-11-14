import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useHandedness,
  getDeviceHandedness,
  setHandedness,
} from './useHandedness';

describe('useHandedness - Modo Diestro y Zurdo', () => {
  beforeEach(() => {
    localStorage.clear();
    setHandedness('right');
    document.documentElement.classList.remove('left-handed');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe iniciar en "right" por defecto', () => {
    expect(getDeviceHandedness()).toBe('right');
    expect(document.documentElement.classList.contains('left-handed')).toBe(false);
  });

  it('debe cambiar a "left" y añadir la clase left-handed al elemento raíz', () => {
    const { result } = renderHook(() => useHandedness());

    act(() => {
      result.current.setHandedness('left');
    });

    expect(result.current.isLeftHanded).toBe(true);
    expect(result.current.handedness).toBe('left');
    expect(document.documentElement.classList.contains('left-handed')).toBe(true);
    expect(localStorage.getItem('girasoles_handedness')).toBe('left');
  });

  it('debe alternar con toggleHandedness', () => {
    const { result } = renderHook(() => useHandedness());

    act(() => {
      result.current.toggleHandedness();
    });

    expect(result.current.handedness).toBe('left');

    act(() => {
      result.current.toggleHandedness();
    });

    expect(result.current.handedness).toBe('right');
    expect(document.documentElement.classList.contains('left-handed')).toBe(false);
  });
});
