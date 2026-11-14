import { describe, it, expect } from 'vitest';
import { formatCurrency, pluralizar } from './format';
import { formatLimaFechaHora, formatLimaFecha, formatHora } from './fechas';
import { canonicalizarMesa, normalizeText, naturalCompare } from './canonico';
import {
  validarDni,
  validarRuc,
  validarMonto,
  requiereDniBoleta,
  validarBoleta,
} from './validaciones';

describe('utils - Formato y Canonicalización', () => {
  describe('formatCurrency', () => {
    it('debe formatear números a moneda peruana S/ con dos decimales', () => {
      expect(formatCurrency(25)).toBe('S/ 25.00');
      expect(formatCurrency(19.9)).toBe('S/ 19.90');
      expect(formatCurrency(0)).toBe('S/ 0.00');
      expect(formatCurrency(1250.75)).toBe('S/ 1250.75');
    });

    it('debe tolerar NaN y valores no numéricos devolviendo S/ 0.00', () => {
      expect(formatCurrency(NaN)).toBe('S/ 0.00');
      expect(formatCurrency(undefined as unknown as number)).toBe('S/ 0.00');
    });
  });

  describe('pluralizar', () => {
    it('debe devolver singular para cantidad 1', () => {
      expect(pluralizar(1, 'pedido')).toBe('1 pedido');
      expect(pluralizar(1, 'mesa')).toBe('1 mesa');
    });

    it('debe pluralizar correctamente agregando "s" por defecto', () => {
      expect(pluralizar(2, 'pedido')).toBe('2 pedidos');
      expect(pluralizar(5, 'comanda')).toBe('5 comandas');
      expect(pluralizar(0, 'pedido')).toBe('0 pedidos');
    });

    it('debe permitir pasar un plural irregular personalizado', () => {
      expect(pluralizar(3, 'análisis', 'análisis')).toBe('3 análisis');
    });

    it('nunca debe duplicar el número en frases reales de interfaz (R-C)', () => {
      expect(pluralizar(12, 'mesa registrada', 'mesas registradas')).toBe('12 mesas registradas');
      expect(`¡Tiene ${pluralizar(1, 'pedido listo', 'pedidos listos')} en cocina!`).toBe(
        '¡Tiene 1 pedido listo en cocina!'
      );
      expect(`¡Tiene ${pluralizar(2, 'pedido listo', 'pedidos listos')} en cocina!`).toBe(
        '¡Tiene 2 pedidos listos en cocina!'
      );
    });
  });

  describe('fechas en America/Lima (R-C)', () => {
    it('convierte fechas ISO UTC a formato local de Lima DD/MM/AAAA HH:mm', () => {
      expect(formatLimaFechaHora('2026-11-14T04:52:13.405267Z')).toBe('13/11/2026 23:52');
      expect(formatLimaFecha('2026-11-14T04:52:13.405267Z')).toBe('13/11/2026');
      expect(formatHora('2026-11-14T04:52:13.405267Z')).toBe('23:52');
    });

    it('formatea fechas AAAA-MM-DD sin desfase de medianoche UTC', () => {
      expect(formatLimaFecha('2026-10-05')).toBe('05/10/2026');
    });
  });

  describe('canonicalizarMesa', () => {
    it('debe convertir a mayúsculas, remover tildes y colapsar espacios', () => {
      expect(canonicalizarMesa('   mesa   1  ')).toBe('MESA 1');
      expect(canonicalizarMesa('Salón   Principal')).toBe('SALON PRINCIPAL');
      expect(canonicalizarMesa('TERRAZA   ÁRBOL')).toBe('TERRAZA ARBOL');
    });
  });

  describe('normalizeText', () => {
    it('debe limpiar espacios en blanco redundantes', () => {
      expect(normalizeText('  texto   de   prueba  ')).toBe('texto de prueba');
      expect(normalizeText('')).toBe('');
    });
  });

  describe('naturalCompare', () => {
    it('debe ordenar alfanuméricamente de forma natural (Mesa 2 antes de Mesa 10)', () => {
      const mesas = ['Mesa 10', 'Mesa 1', 'Mesa 2', 'Mesa 20'];
      mesas.sort(naturalCompare);
      expect(mesas).toEqual(['Mesa 1', 'Mesa 2', 'Mesa 10', 'Mesa 20']);
    });
  });
});

describe('utils - Validaciones de Negocio', () => {
  describe('validarDni', () => {
    it('debe aceptar DNI válido de 8 dígitos numéricos', () => {
      expect(validarDni('12345678').valido).toBe(true);
      expect(validarDni('87654321').valido).toBe(true);
    });

    it('debe rechazar DNI con menos o más de 8 dígitos o caracteres alfabéticos', () => {
      expect(validarDni('1234567').valido).toBe(false);
      expect(validarDni('123456789').valido).toBe(false);
      expect(validarDni('1234567A').valido).toBe(false);
      expect(validarDni('').valido).toBe(false);
    });
  });

  describe('validarRuc', () => {
    it('debe aceptar RUC válido de 11 dígitos que comience con 10 o 20', () => {
      expect(validarRuc('10123456789').valido).toBe(true);
      expect(validarRuc('20987654321').valido).toBe(true);
    });

    it('debe rechazar RUC que comience con prefijo distinto de 10 o 20', () => {
      const res = validarRuc('15123456789');
      expect(res.valido).toBe(false);
      expect(res.error).toContain('comenzar con 10 o 20');
    });

    it('debe rechazar RUC con longitud distinta de 11 dígitos', () => {
      expect(validarRuc('1012345678').valido).toBe(false);
      expect(validarRuc('201234567890').valido).toBe(false);
    });
  });

  describe('requiereDniBoleta y validarBoleta (umbral S/ 700)', () => {
    it('debe requerir DNI para montos de S/ 700 o más', () => {
      expect(requiereDniBoleta(700)).toBe(true);
      expect(requiereDniBoleta(700.01)).toBe(true);
      expect(requiereDniBoleta(1500)).toBe(true);
    });

    it('no debe requerir DNI para montos menores a S/ 700', () => {
      expect(requiereDniBoleta(699.99)).toBe(false);
      expect(requiereDniBoleta(50)).toBe(false);
    });

    it('validarBoleta debe exigir DNI válido si total >= S/ 700', () => {
      // Menor a 700 no exige DNI
      expect(validarBoleta(150).valido).toBe(true);

      // Mayor o igual a 700 sin DNI o con DNI inválido debe fallar
      const resSinDoc = validarBoleta(700, '');
      expect(resSinDoc.valido).toBe(false);
      expect(resSinDoc.error).toContain('S/ 700 o más exigen el DNI');

      const resInvalido = validarBoleta(850, '123');
      expect(resInvalido.valido).toBe(false);

      // Con DNI de 8 dígitos debe aprobar
      const resValido = validarBoleta(750, '45678901');
      expect(resValido.valido).toBe(true);
    });
  });

  describe('validarMonto', () => {
    it('debe validar montos dentro del rango especificado', () => {
      expect(validarMonto(50, 0, 1000).valido).toBe(true);
      expect(validarMonto('100.50', 0, 1000).valido).toBe(true);
    });

    it('debe rechazar montos inferiores al mínimo o superiores al máximo', () => {
      expect(validarMonto(-5, 0, 100).valido).toBe(false);
      expect(validarMonto(150, 0, 100).valido).toBe(false);
    });

    it('debe rechazar valores no numéricos', () => {
      expect(validarMonto('abc', 0, 100).valido).toBe(false);
    });
  });
});
