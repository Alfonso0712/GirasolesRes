import { describe, it, expect } from 'vitest';
import {
  normalizarNombreMesa,
  calcularMinutosOcupadaDesdeHora,
  combinarMesasConPedidos,
} from './useMesasConPedidos';
import type { MesaItem } from '../types/mesa';
import type { PedidoItemDto } from '../types/pedido';
import type { PedidoPendienteCobro } from '../types/cobro';

describe('useMesasConPedidos (R-E)', () => {
  it('normaliza nombres de mesa ignorando mayúsculas y espacios extras', () => {
    expect(normalizarNombreMesa('  Mesa   1 ')).toBe('mesa 1');
    expect(normalizarNombreMesa(null)).toBe('');
  });

  it('calcula minutos en mesa reales desde hora HH:mm en America/Lima sin devolver 0', () => {
    // 2026-11-14T17:30:00Z = 12:30 en Lima (UTC-5)
    const ahoraMs = new Date('2026-11-14T17:30:00Z').getTime();
    expect(calcularMinutosOcupadaDesdeHora('12:05', ahoraMs)).toBe(25);
    expect(calcularMinutosOcupadaDesdeHora('12:30', ahoraMs)).toBe(1);
    expect(calcularMinutosOcupadaDesdeHora('', ahoraMs)).toBeNull();
  });

  it('combina mesas ocupadas con cobros pendientes y pedidos del día', () => {
    const ahoraMs = new Date('2026-11-14T17:45:00Z').getTime(); // 12:45 Lima
    const mesas: MesaItem[] = [
      { id: 'm1', nombre: 'Mesa 1', ocupacion: 'Ocupada', activa: true },
      { id: 'm2', nombre: 'Mesa 2', ocupacion: 'Libre', activa: true },
      { id: 'm3', nombre: 'Mesa 3', ocupacion: 'Ocupada', activa: true },
    ];

    const cobros: PedidoPendienteCobro[] = [
      {
        pedidoId: 'p1',
        numero: 14,
        mesaId: 'm1',
        mesa: 'Mesa 1',
        hora: '12:20',
        estado: 'Listo',
        total: 42.5,
      },
    ];

    const pedidosDia: PedidoItemDto[] = [
      {
        id: 'p2',
        numero: 15,
        tipo: 'Mesa',
        mesa: 'Mesa 1',
        hora: '12:35',
        total: 18,
        estado: 'EnPreparacion',
        registradoPor: 'Mozo Juan',
        usuarioId: 'u1',
      },
    ];

    const resultado = combinarMesasConPedidos(mesas, pedidosDia, cobros, ahoraMs);

    const mesa1 = resultado.find((m) => m.id === 'm1')!;
    expect(mesa1.totalPendiente).toBeCloseTo(60.5);
    expect(mesa1.minutosOcupada).toBe(25);
    expect(mesa1.pedidosMesa).toHaveLength(2);
    expect(mesa1.pedidosMesa?.[0].numero).toBe(14);
    expect(mesa1.pedidosMesa?.[1].numero).toBe(15);

    const mesa2 = resultado.find((m) => m.id === 'm2')!;
    expect(mesa2.totalPendiente).toBeNull();
    expect(mesa2.minutosOcupada).toBeNull();

    // Mesa 3 está Ocupada pero sin datos disponibles -> null (no 0 por omisión)
    const mesa3 = resultado.find((m) => m.id === 'm3')!;
    expect(mesa3.totalPendiente).toBeNull();
    expect(mesa3.minutosOcupada).toBeNull();
  });
});
