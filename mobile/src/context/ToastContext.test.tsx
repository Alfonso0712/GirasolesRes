import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

const ComponenteConsumidor = () => {
  const { mostrar, ocultar } = useToast();
  return (
    <div>
      <button
        type="button"
        onClick={() => mostrar({ tipo: 'exito', mensaje: 'Comanda enviada a cocina' })}
      >
        Disparar Éxito
      </button>

      <button
        type="button"
        onClick={() => mostrar({ tipo: 'error', mensaje: 'Error al procesar el pago' })}
      >
        Disparar Error
      </button>

      <button type="button" onClick={ocultar}>
        Cerrar Manual
      </button>
    </div>
  );
};

describe('ToastProvider - Sistema de Notificaciones Flotantes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe mostrar la notificación de éxito al invocarse', () => {
    render(
      <ToastProvider>
        <ComponenteConsumidor />
      </ToastProvider>
    );

    expect(screen.queryByText('Comanda enviada a cocina')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Disparar Éxito'));
    expect(screen.getByText('Comanda enviada a cocina')).toBeInTheDocument();
  });

  it('debe mostrar la notificación de error al invocarse', () => {
    render(
      <ToastProvider>
        <ComponenteConsumidor />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Disparar Error'));
    expect(screen.getByText('Error al procesar el pago')).toBeInTheDocument();
  });

  it('debe cerrarse automáticamente al transcurrir el temporizador', () => {
    render(
      <ToastProvider>
        <ComponenteConsumidor />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Disparar Éxito'));
    expect(screen.getByText('Comanda enviada a cocina')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(screen.queryByText('Comanda enviada a cocina')).not.toBeInTheDocument();
  });

  it('debe permitir cierre manual mediante la función ocultar', () => {
    render(
      <ToastProvider>
        <ComponenteConsumidor />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Disparar Éxito'));
    expect(screen.getByText('Comanda enviada a cocina')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cerrar Manual'));
    expect(screen.queryByText('Comanda enviada a cocina')).not.toBeInTheDocument();
  });
});
