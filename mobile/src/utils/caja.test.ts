import { describe, it, expect } from 'vitest';
import { calcularEfectivoEsperado } from './caja';

describe('utils/caja', () => {
  it('suma fondo inicial y ventas en efectivo', () => {
    expect(calcularEfectivoEsperado(200, 350.5)).toBeCloseTo(550.5, 6);
    expect(calcularEfectivoEsperado(0, 120)).toBe(120);
  });

  it('trata apertura ausente (null/undefined) como fondo inicial 0 sin lanzar', () => {
    expect(calcularEfectivoEsperado(undefined, 85)).toBe(85);
    expect(calcularEfectivoEsperado(null, 0)).toBe(0);
  });
});
