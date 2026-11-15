import { describe, it, expect } from 'vitest';
import {
  MAX_CANTIDAD_POR_LINEA,
  BILLETES_RAPIDOS_EFECTIVO,
  MONTO_MAXIMO_EFECTIVO_COBRO,
  MONTO_MAXIMO_CAJA,
  MINUTOS_DEMORA_KDS,
  SEGUNDOS_UNDO_KDS,
} from './constantes';

describe('config/constantes', () => {
  it('mantiene los límites operativos de pedidos y cobros', () => {
    expect(MAX_CANTIDAD_POR_LINEA).toBe(20);
    expect(BILLETES_RAPIDOS_EFECTIVO).toEqual([20, 50, 100]);
    expect(MONTO_MAXIMO_EFECTIVO_COBRO).toBe(9999.99);
    expect(MONTO_MAXIMO_CAJA).toBe(99999.99);
  });

  it('mantiene los umbrales de tiempo del KDS de cocina', () => {
    expect(MINUTOS_DEMORA_KDS).toBe(15);
    expect(SEGUNDOS_UNDO_KDS).toBe(10);
  });
});
