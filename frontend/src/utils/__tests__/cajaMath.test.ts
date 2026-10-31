import { describe, it, expect } from 'vitest';
import {
  parseContado,
  calcularDiferenciaCierre,
  validarCierreCaja,
} from '../cajaMath';

describe('cajaMath - Cálculos y validaciones de arqueo de caja', () => {
  describe('parseContado', () => {
    it('retorna null para string vacío o con solo espacios', () => {
      expect(parseContado('')).toBeNull();
      expect(parseContado('   ')).toBeNull();
    });

    it('retorna null para valores inválidos o negativos', () => {
      expect(parseContado('abc')).toBeNull();
      expect(parseContado('-10')).toBeNull();
    });

    it('parsea correctamente con punto o coma decimal', () => {
      expect(parseContado('350.50')).toBe(350.5);
      expect(parseContado('350,50')).toBe(350.5);
      expect(parseContado('100')).toBe(100);
    });

    it('redondea a dos decimales', () => {
      expect(parseContado('12.345')).toBe(12.35);
    });
  });

  describe('calcularDiferenciaCierre', () => {
    it('retorna null si contado o efectivoEsperado son nulos/undefined', () => {
      expect(calcularDiferenciaCierre(null, 100)).toBeNull();
      expect(calcularDiferenciaCierre(100, undefined)).toBeNull();
    });

    it('calcula correctamente el cuadre (diferencia 0)', () => {
      expect(calcularDiferenciaCierre(350, 350)).toBe(0);
    });

    it('calcula faltante (diferencia negativa)', () => {
      expect(calcularDiferenciaCierre(320, 350)).toBe(-30);
    });

    it('calcula sobrante (diferencia positiva)', () => {
      expect(calcularDiferenciaCierre(380, 350)).toBe(30);
    });
  });

  describe('validarCierreCaja', () => {
    it('falla si el monto contado es nulo', () => {
      const res = validarCierreCaja(null, '');
      expect(res.ok).toBe(false);
      expect(res.error).toBe('Ingrese el efectivo contado.');
    });

    it('falla si el monto supera 99999.99', () => {
      const res = validarCierreCaja(100000, '');
      expect(res.ok).toBe(false);
      expect(res.error).toBe('El monto no puede superar S/ 99,999.99.');
    });

    it('falla si la observación supera los 200 caracteres', () => {
      const res = validarCierreCaja(350, 'a'.repeat(201));
      expect(res.ok).toBe(false);
      expect(res.error).toBe('La observación no puede superar los 200 caracteres.');
    });

    it('pasa con valores válidos y observación recortada', () => {
      const res = validarCierreCaja(350, '  todo bien  ');
      expect(res.ok).toBe(true);
      expect(res.contado).toBe(350);
      expect(res.obs).toBe('todo bien');
    });
  });
});
