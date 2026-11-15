import { describe, it, expect } from 'vitest';
import {
  UMBRAL_DNI_BOLETA,
  calcularOpGravada,
  calcularIgv,
  requiereDniBoleta,
} from './fiscal';

describe('utils/fiscal (reglas SUNAT IGV y Boleta S/ 700)', () => {
  describe('requiereDniBoleta - frontera S/ 700.00', () => {
    it('no exige DNI por debajo de S/ 700.00', () => {
      expect(UMBRAL_DNI_BOLETA).toBe(700);
      expect(requiereDniBoleta(0)).toBe(false);
      expect(requiereDniBoleta(699.99)).toBe(false);
    });

    it('exige DNI exactamente desde S/ 700.00 hacia arriba', () => {
      expect(requiereDniBoleta(700)).toBe(true);
      expect(requiereDniBoleta(700.01)).toBe(true);
      expect(requiereDniBoleta(1500)).toBe(true);
    });

    it('rechaza valores inválidos o NaN', () => {
      expect(requiereDniBoleta(-1)).toBe(false);
      expect(requiereDniBoleta(Number.NaN)).toBe(false);
    });
  });

  describe('calcularOpGravada y calcularIgv (18%)', () => {
    it('calcula opGravada e IGV a partir del total cuando no vienen precalculados', () => {
      const total = 118;
      expect(calcularOpGravada(total)).toBeCloseTo(100, 6);
      expect(calcularIgv(total)).toBeCloseTo(18, 6);
    });

    it('mantiene suma exacta opGravada + igv == total y redondeo a 2 decimales consistente', () => {
      const total = 59.9;
      const opGravada = calcularOpGravada(total);
      const igv = calcularIgv(total);
      expect(opGravada + igv).toBeCloseTo(total, 10);
      expect(Number(opGravada.toFixed(2))).toBe(50.76);
      expect(Number(igv.toFixed(2))).toBe(9.14);
    });

    it('respeta los montos reportados por backend cuando son mayores a 0', () => {
      expect(calcularOpGravada(118, 100.01)).toBe(100.01);
      expect(calcularIgv(118, 17.99)).toBe(17.99);
    });

    it('cae al cálculo con factor 1.18 si el monto reportado es 0, null o undefined', () => {
      expect(calcularOpGravada(118, 0)).toBeCloseTo(100, 6);
      expect(calcularOpGravada(118, null)).toBeCloseTo(100, 6);
      expect(calcularIgv(118, 0)).toBeCloseTo(18, 6);
      expect(calcularIgv(118, undefined)).toBeCloseTo(18, 6);
    });
  });
});
