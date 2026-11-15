// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KdsView } from './KdsView';
import { ToastProvider } from '../../context/ToastContext';
import { ApiError } from '../../services/apiClient';
import type { ComandaKdsItem } from '../../types/comanda';

vi.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    triggerLight: vi.fn(),
    triggerMedium: vi.fn(),
    triggerSuccess: vi.fn(),
    triggerError: vi.fn(),
  }),
}));

vi.mock('../../utils/audioKds', () => ({
  reproducirSonidoKds: vi.fn(),
}));

const COMANDA_PENDIENTE: ComandaKdsItem = {
  id: 'cmd-101',
  pedidoNumero: 101,
  tipo: 'Mesa',
  mesa: 'Mesa 2',
  referencia: null,
  horaLlegada: '12:10',
  fechaHoraLlegadaUtc: '2026-11-14T17:10:00Z',
  estado: 'Pendiente',
  etiqueta: null,
  esAdicional: false,
  numeroAdicional: 0,
  modificada: false,
  registradoPor: 'Mozo Juan',
  minutosEspera: 4,
  esDemora: false,
  lineas: [{ producto: 'Ceviche', cantidad: 1 }],
};

describe('KdsView - Política de errores y avisos de fallo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra aviso de error con Reintentar, resincroniza lista y no altera el estado visible si falla cambiar estado', async () => {
    const onCambiarEstado = vi
      .fn()
      .mockRejectedValueOnce(new ApiError({ status: 409, mensaje: 'La comanda ya está en preparación.' }))
      .mockResolvedValueOnce(undefined);
    const onRefresh = vi.fn().mockResolvedValue(undefined);

    render(
      <ToastProvider>
        <KdsView
          comandas={[COMANDA_PENDIENTE]}
          cargando={false}
          error={null}
          onRefresh={onRefresh}
          onCambiarEstado={onCambiarEstado}
          onDeshacer={vi.fn()}
        />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Empezar preparación del pedido número 101' }));

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo actualizar la comanda. La comanda ya está en preparación.')
      ).toBeTruthy();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('region', { name: 'Opción para deshacer acción de cocina' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => {
      expect(onCambiarEstado).toHaveBeenCalledTimes(2);
    });
  });

  it('no muestra toast ante 401', async () => {
    const onCambiarEstado = vi.fn().mockRejectedValueOnce(new ApiError({ status: 401, mensaje: 'Sesión expirada' }));
    const onRefresh = vi.fn();

    render(
      <ToastProvider>
        <KdsView
          comandas={[COMANDA_PENDIENTE]}
          cargando={false}
          error={null}
          onRefresh={onRefresh}
          onCambiarEstado={onCambiarEstado}
        />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Empezar preparación del pedido número 101' }));

    await waitFor(() => {
      expect(onCambiarEstado).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByRole('alert')).toBeNull();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('muestra barra de deshacer y sin aviso de error cuando tiene éxito; avisa si falla deshacer', async () => {
    const onCambiarEstado = vi.fn().mockResolvedValue(undefined);
    const onDeshacer = vi.fn().mockRejectedValueOnce(new ApiError({ status: 400, mensaje: 'Expiró el plazo para deshacer.' }));
    const onRefresh = vi.fn().mockResolvedValue(undefined);

    render(
      <ToastProvider>
        <KdsView
          comandas={[COMANDA_PENDIENTE]}
          cargando={false}
          error={null}
          onRefresh={onRefresh}
          onCambiarEstado={onCambiarEstado}
          onDeshacer={onDeshacer}
        />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Empezar preparación del pedido número 101' }));

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Opción para deshacer acción de cocina' })).toBeTruthy();
    });
    expect(screen.queryByText(/No se pudo/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo revertir la comanda. Expiró el plazo para deshacer.')
      ).toBeTruthy();
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
