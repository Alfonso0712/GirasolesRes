import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardCajeroView } from '../DashboardCajeroView';

describe('DashboardCajeroView - Navegación a Cobros y Caja', () => {
  const bloquesMock = {
    caja: {
      estado: 'ok',
      datos: {
        estado: 'Abierta',
        ventas: 0,
        efectivo: 0,
        yape: 0,
        total: 0,
        montoInicial: 200,
        totalEsperado: 200,
      },
    },
    porCobrar: {
      estado: 'ok',
      datos: {
        cantidad: 11,
        monto: 414.5,
      },
    },
    listos: {
      estado: 'ok',
      datos: {
        cantidad: 11,
      },
    },
  };

  it('debe llamar onNavigate con "caja" al hacer clic en "Ir a módulo de Cobros"', () => {
    const onNavigateMock = vi.fn();
    render(
      <DashboardCajeroView
        bloques={bloquesMock}
        onNavigate={onNavigateMock}
        renderBloqueError={() => null}
      />
    );

    const botonIrCobros = screen.getByText(/Ir a módulo de Cobros/i);
    fireEvent.click(botonIrCobros);

    expect(onNavigateMock).toHaveBeenCalledWith('caja');
  });

  it('debe llamar onNavigate con "caja" al hacer clic en la acción rápida "COBRAR PEDIDO"', () => {
    const onNavigateMock = vi.fn();
    render(
      <DashboardCajeroView
        bloques={bloquesMock}
        onNavigate={onNavigateMock}
        renderBloqueError={() => null}
      />
    );

    const botonCobrarPedido = screen.getByText(/COBRAR PEDIDO/i);
    fireEvent.click(botonCobrarPedido);

    expect(onNavigateMock).toHaveBeenCalledWith('caja');
  });
});
