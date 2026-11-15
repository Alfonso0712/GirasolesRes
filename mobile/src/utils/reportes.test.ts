import { describe, it, expect } from 'vitest';
import { calcularPorcentajeBarraRanking } from './reportes';

describe('utils/reportes', () => {
  it('calcula porcentaje redondeado respecto al máximo del ranking', () => {
    expect(calcularPorcentajeBarraRanking(25, 50)).toBe(50);
    expect(calcularPorcentajeBarraRanking(1, 3)).toBe(33);
    expect(calcularPorcentajeBarraRanking(50, 50)).toBe(100);
  });

  it('aplica piso visual del 4% y techo del 100%', () => {
    expect(calcularPorcentajeBarraRanking(0, 100)).toBe(4);
    expect(calcularPorcentajeBarraRanking(1, 1000)).toBe(4);
    expect(calcularPorcentajeBarraRanking(150, 100)).toBe(100);
  });

  it('evita división por cero cuando maxCantidad <= 0', () => {
    expect(calcularPorcentajeBarraRanking(10, 0)).toBe(4);
    expect(calcularPorcentajeBarraRanking(10, -5)).toBe(4);
  });
});
