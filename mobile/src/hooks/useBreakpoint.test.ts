import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBreakpoint } from './useBreakpoint';

describe('useBreakpoint - Detección reactiva de puntos de quiebre', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  const setWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('debe detectar móvil para anchos menores a 768px', () => {
    setWidth(360);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTabletOrWider).toBe(false);
    expect(result.current.breakpoint).toBe('mobile');
  });

  it('debe detectar tableta para anchos entre 768px y 1023px', () => {
    setWidth(768);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTabletOrWider).toBe(true);
    expect(result.current.breakpoint).toBe('tablet');
  });

  it('debe detectar escritorio/tableta ancha para anchos mayores o iguales a 1024px', () => {
    setWidth(1024);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTabletOrWider).toBe(true);
    expect(result.current.breakpoint).toBe('desktop');
  });

  it('debe actualizar el estado reactivamente al redimensionar la ventana', () => {
    setWidth(412);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(true);

    act(() => {
      setWidth(800);
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isTabletOrWider).toBe(true);
  });
});
