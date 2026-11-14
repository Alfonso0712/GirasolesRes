import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { calcularRangoMes, generarUltimos12Meses, MesSheet } from './MesSheet';

describe('MesSheet y cálculo de rangos mensuales (R-C)', () => {
  it('calcula febrero de un año no bisiesto (28 días) y de un año bisiesto (29 días)', () => {
    const febNoBisiesto = calcularRangoMes(2026, 2, '2026-11-14');
    expect(febNoBisiesto).toEqual({
      id: '2026-02',
      etiqueta: 'Febrero 2026',
      desde: '2026-02-01',
      hasta: '2026-02-28',
    });

    const febBisiesto = calcularRangoMes(2024, 2, '2026-11-14');
    expect(febBisiesto).toEqual({
      id: '2024-02',
      etiqueta: 'Febrero 2024',
      desde: '2024-02-01',
      hasta: '2024-02-29',
    });
  });

  it('usa hasta = hoy en Lima para el mes actual y fin de mes para meses pasados', () => {
    const mesActual = calcularRangoMes(2026, 11, '2026-11-14');
    expect(mesActual.desde).toBe('2026-11-01');
    expect(mesActual.hasta).toBe('2026-11-14');

    const mesPasado = calcularRangoMes(2026, 10, '2026-11-14');
    expect(mesPasado.desde).toBe('2026-10-01');
    expect(mesPasado.hasta).toBe('2026-10-31');
  });

  it('genera los últimos 12 meses manejando el cambio de año correctamente', () => {
    const lista = generarUltimos12Meses('2026-02-10');
    expect(lista).toHaveLength(12);
    expect(lista[0]).toEqual({
      id: '2026-02',
      etiqueta: 'Febrero 2026',
      desde: '2026-02-01',
      hasta: '2026-02-10',
    });
    expect(lista[1]).toEqual({
      id: '2026-01',
      etiqueta: 'Enero 2026',
      desde: '2026-01-01',
      hasta: '2026-01-31',
    });
    expect(lista[2]).toEqual({
      id: '2025-12',
      etiqueta: 'Diciembre 2025',
      desde: '2025-12-01',
      hasta: '2025-12-31',
    });
    expect(lista[11].id).toBe('2025-03');
  });

  it('renderiza la hoja con "Todos los meses" opcional y emite la selección', () => {
    const onSeleccionar = vi.fn();
    const onClose = vi.fn();

    render(
      <MesSheet
        isOpen={true}
        onClose={onClose}
        incluirTodos={true}
        mesSeleccionadoId="2026-11"
        hoyReferenciaYMD="2026-11-14"
        onSeleccionar={onSeleccionar}
      />
    );

    expect(screen.getByText('Todos los meses')).toBeInTheDocument();
    expect(screen.getByText('Noviembre 2026')).toBeInTheDocument();
    expect(screen.getByText('Octubre 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Octubre 2026'));
    expect(onSeleccionar).toHaveBeenCalledWith({
      id: '2026-10',
      etiqueta: 'Octubre 2026',
      desde: '2026-10-01',
      hasta: '2026-10-31',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
