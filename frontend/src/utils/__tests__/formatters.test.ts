import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDecimal,
  formatDateIso,
  getFechaActualLimaStr,
  restarDiasLimaStr,
  formatLimaFecha,
  formatearHoraApertura,
  formatFechaLarga,
  formatMinutosEspera,
  formatHoraLlegada,
  formatCategoriaLabel,
} from '../formatters';

describe('formatters utility', () => {
  describe('formatCurrency', () => {
    it('formatea números con prefijo S/ y 2 decimales', () => {
      expect(formatCurrency(12)).toBe('S/ 12.00');
      expect(formatCurrency(12.5)).toBe('S/ 12.50');
      expect(formatCurrency(0)).toBe('S/ 0.00');
    });

    it('maneja valores nulos, indefinidos o NaN con valor por defecto S/ 0.00', () => {
      expect(formatCurrency(null)).toBe('S/ 0.00');
      expect(formatCurrency(undefined)).toBe('S/ 0.00');
      expect(formatCurrency(NaN)).toBe('S/ 0.00');
    });
  });

  describe('formatDecimal', () => {
    it('formatea números con 2 decimales sin prefijo', () => {
      expect(formatDecimal(15)).toBe('15.00');
      expect(formatDecimal(15.9)).toBe('15.90');
      expect(formatDecimal(null)).toBe('0.00');
    });
  });

  describe('formatDateIso', () => {
    it('formatea una fecha en YYYY-MM-DD', () => {
      const d = new Date(2026, 9, 30); // Octubre es mes 9 (0-indexed)
      expect(formatDateIso(d)).toBe('2026-10-30');
    });
  });

  describe('Lima timezone dates', () => {
    it('genera fecha actual en formato YYYY-MM-DD', () => {
      const hoyLima = getFechaActualLimaStr();
      expect(hoyLima).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('resta días en formato YYYY-MM-DD', () => {
      const ayerLima = restarDiasLimaStr(1);
      expect(ayerLima).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatLimaFecha', () => {
    it('formatea fecha UTC a formato de Lima', () => {
      const res = formatLimaFecha('2026-10-30T15:30:00Z');
      expect(res).toContain('30/10/2026');
    });

    it('maneja valores vacíos', () => {
      expect(formatLimaFecha(null)).toBe('—');
      expect(formatLimaFecha('')).toBe('—');
    });
  });

  describe('formatearHoraApertura', () => {
    it('prioriza localStr si existe', () => {
      expect(formatearHoraApertura(undefined, '08:30 AM')).toBe('08:30 AM');
    });

    it('formatea isoDate si no hay localStr', () => {
      const res = formatearHoraApertura('2026-10-30T13:45:00Z');
      expect(res).toMatch(/\d{2}:\d{2}/);
    });

    it('devuelve --:-- si no hay fecha', () => {
      expect(formatearHoraApertura()).toBe('--:--');
    });
  });

  describe('formatFechaLarga', () => {
    it('formatea fecha extendida en español', () => {
      const res = formatFechaLarga('2026-10-30T12:00:00');
      expect(res.toLowerCase()).toContain('octubre');
      expect(res).toContain('2026');
    });
  });

  describe('formatMinutosEspera y formatHoraLlegada', () => {
    it('formatea minutos de espera', () => {
      expect(formatMinutosEspera(8)).toBe('8 min');
      expect(formatMinutosEspera(null)).toBe('0 min');
    });

    it('formatea hora de llegada', () => {
      expect(formatHoraLlegada('13:45')).toBe('Llegó: 13:45');
      expect(formatHoraLlegada(null)).toBe('');
    });
  });

  describe('formatCategoriaLabel', () => {
    it('re-exporta y formatea categorías correctamente', () => {
      expect(formatCategoriaLabel('PlatosExtras')).toBe('Platos extras');
    });
  });
});
