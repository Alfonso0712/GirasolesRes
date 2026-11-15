// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../context/ToastContext';
import { ApiError } from '../services/apiClient';
import { useAccionConAviso } from './useAccionConAviso';

function Wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('useAccionConAviso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna true y no muestra toast cuando la accion tiene exito', async () => {
    const { result } = renderHook(() => useAccionConAviso(), { wrapper: Wrapper });
    let esExitoso = false;

    await act(async () => {
      esExitoso = await result.current.ejecutar(async () => undefined, {
        mensajeError: 'No se pudo completar la accion.',
      });
    });

    expect(esExitoso).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('muestra mensaje del servidor ante ApiError y ejecuta onError y Reintentar', async () => {
    const onError = vi.fn();
    const reintentar = vi.fn();
    function Demo() {
      const { ejecutar } = useAccionConAviso();
      return (
        <button
          type="button"
          onClick={() => {
            void ejecutar(
              async () => {
                throw new ApiError({ status: 409, mensaje: 'La comanda ya fue preparada.' });
              },
              {
                mensajeError: 'No se pudo actualizar la comanda.',
                prefijoServidor: 'No se pudo actualizar la comanda.',
                reintentar,
                onError,
              }
            );
          }}
        >
          Ejecutar
        </button>
      );
    }

    render(<Demo />, { wrapper: Wrapper });
    await act(async () => {
      fireEvent.click(screen.getByText('Ejecutar'));
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('No se pudo actualizar la comanda. La comanda ya fue preparada.')
    ).toBeTruthy();

    fireEvent.click(screen.getByText('Reintentar'));
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('usa el mensajeError por defecto ante errores tecnicos no ApiError', async () => {
    function Demo() {
      const { ejecutar } = useAccionConAviso();
      return (
        <button
          type="button"
          onClick={() => {
            void ejecutar(
              async () => {
                throw new TypeError('Cannot read properties of undefined');
              },
              { mensajeError: 'No se pudo desactivar la mesa.' }
            );
          }}
        >
          Ejecutar
        </button>
      );
    }

    render(<Demo />, { wrapper: Wrapper });
    await act(async () => {
      fireEvent.click(screen.getByText('Ejecutar'));
    });

    expect(screen.getByText('No se pudo desactivar la mesa.')).toBeTruthy();
    expect(screen.queryByText(/Cannot read properties/i)).toBeNull();
  });

  it('ignora errores 401 sin mostrar toast ni llamar a onError', async () => {
    const onError = vi.fn();
    function Demo() {
      const { ejecutar } = useAccionConAviso();
      return (
        <button
          type="button"
          onClick={() => {
            void ejecutar(
              async () => {
                throw new ApiError({ status: 401, mensaje: 'Sesion expirada' });
              },
              { mensajeError: 'Error al guardar.', onError }
            );
          }}
        >
          Ejecutar
        </button>
      );
    }

    render(<Demo />, { wrapper: Wrapper });
    await act(async () => {
      fireEvent.click(screen.getByText('Ejecutar'));
    });

    expect(onError).not.toHaveBeenCalled();
    expect(screen.queryByText('Sesion expirada')).toBeNull();
    expect(screen.queryByText('Error al guardar.')).toBeNull();
  });
});
