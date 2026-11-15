// @vitest-environment jsdom
import { useEffect, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ToastProvider } from '../context/ToastContext';
import { ApiError } from '../services/apiClient';
import { useAvisoPorTransicion } from './useAvisoPorTransicion';

function Wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('useAvisoPorTransicion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('emite un solo aviso ante varias fallas consecutivas de polling y vuelve a avisar tras un exito', async () => {
    const resultados = [false, false, false, true, false];
    let indice = 0;
    const avisosEmitidos: number[] = [];

    function PollingDemo() {
      const { registrarExito, registrarFallo } = useAvisoPorTransicion();

      useEffect(() => {
        const timer = setInterval(() => {
          const ok = resultados[indice];
          indice += 1;
          if (ok) {
            registrarExito();
          } else {
            const emitio = registrarFallo(
              new ApiError({ status: 503, mensaje: 'Servicio temporalmente no disponible' }),
              {
              mensajePorDefecto: 'No se pudieron cargar los pedidos de las mesas.',
            });
            if (emitio) avisosEmitidos.push(indice);
          }
        }, 15_000);
        return () => clearInterval(timer);
      }, [registrarExito, registrarFallo]);

      return null;
    }

    render(<PollingDemo />, { wrapper: Wrapper });

    // Tres intervalos seguidos en fallo -> 1 solo aviso en el primero
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    expect(avisosEmitidos).toEqual([1]);
    expect(screen.getByText('No se pudieron cargar los pedidos de las mesas.')).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(avisosEmitidos).toEqual([1]);

    // Cuarto intervalo: exito -> rearma estado
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    expect(avisosEmitidos).toEqual([1]);

    // Quinto intervalo: nuevo fallo -> vuelve a avisar una vez
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    expect(avisosEmitidos).toEqual([1, 5]);
    expect(screen.getByText('No se pudieron cargar los pedidos de las mesas.')).toBeTruthy();
  });

  it('no avisa ni pasa a fallo cuando el error es 401', async () => {
    const emitidos: boolean[] = [];

    function Demo401() {
      const { registrarFallo } = useAvisoPorTransicion();

      useEffect(() => {
        emitidos.push(
          registrarFallo(new ApiError({ status: 401, mensaje: 'No autorizado' }), {
            mensajePorDefecto: 'Falla de polling.',
          })
        );
      }, [registrarFallo]);

      return null;
    }

    render(<Demo401 />, { wrapper: Wrapper });
    expect(emitidos).toEqual([false]);
    expect(screen.queryByText('Falla de polling.')).toBeNull();
  });
});
