import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminAlertsSection } from '../admin/AdminAlertsSection';
import { DashboardCajeroView } from '../DashboardCajeroView';
import type { AlertaInicio } from '../../../types/inicio';

describe('AdminAlertsSection - Alertas Informativas vs Accionables', () => {
  const alertaCajaAnterior: AlertaInicio = {
    tipo: 'caja_anterior',
    texto: 'Hay una caja del 29/10/2026 sin cerrar. Ciérrela antes de abrir una nueva o cobrar.',
    enlace: 'caja',
    prioridad: 1,
  };

  const alertaMenuSinDefinir: AlertaInicio = {
    tipo: 'menu_sin_definir',
    texto: 'El menú de hoy aún no está definido.',
    enlace: 'menu-dia',
    prioridad: 2,
  };

  it('(a) el Administrador ve la alerta de caja sin cerrar con el texto informativo y SIN botón Resolver', () => {
    const onNavigate = vi.fn();
    render(
      <AdminAlertsSection
        alertasRes={{ estado: 'ok' }}
        alertas={[alertaCajaAnterior]}
        onNavigate={onNavigate}
        renderBloqueError={() => null}
      />
    );

    // Texto descriptivo reescrito para el Administrador
    expect(
      screen.getByText(
        'Hay una caja del 29/10/2026 sin cerrar. El cajero debe cerrarla antes de abrir una nueva o cobrar.'
      )
    ).toBeInTheDocument();

    // Texto secundario indicando que la acción corresponde al cajero
    expect(
      screen.getByText('Prioridad 1 · Requiere acción del cajero')
    ).toBeInTheDocument();

    // No debe haber botón Resolver para la alerta de caja
    expect(screen.queryByRole('button', { name: /Resolver/i })).not.toBeInTheDocument();
  });

  it('(b) el Administrador sigue viendo "Resolver" en la alerta del menú no definido', () => {
    const onNavigate = vi.fn();
    render(
      <AdminAlertsSection
        alertasRes={{ estado: 'ok' }}
        alertas={[alertaMenuSinDefinir]}
        onNavigate={onNavigate}
        renderBloqueError={() => null}
      />
    );

    expect(screen.getByText('El menú de hoy aún no está definido.')).toBeInTheDocument();
    expect(
      screen.getByText('Prioridad 2 · Requiere gestión del administrador')
    ).toBeInTheDocument();

    const botonResolver = screen.getByRole('button', { name: /Resolver/i });
    expect(botonResolver).toBeInTheDocument();

    fireEvent.click(botonResolver);
    expect(onNavigate).toHaveBeenCalledWith('menu-dia');
  });

  it('(d) el contador del encabezado cuenta todas las alertas visibles correctamente', () => {
    render(
      <AdminAlertsSection
        alertasRes={{ estado: 'ok' }}
        alertas={[alertaCajaAnterior, alertaMenuSinDefinir]}
        onNavigate={vi.fn()}
        renderBloqueError={() => null}
      />
    );

    expect(screen.getByText('Alertas de Atención Inmediata (2)')).toBeInTheDocument();
  });
});

describe('DashboardCajeroView - Conservación de alerta y acción para Cajero', () => {
  it('(c) el Cajero conserva su alerta con su botón de acción', () => {
    const onNavigate = vi.fn();
    const bloquesConCajaAnterior = {
      caja: {
        estado: 'ok',
        datos: {
          estado: 'Anterior sin cerrar',
          ventas: 0,
          efectivo: 0,
          yape: 0,
          total: 0,
          montoInicial: 100,
          totalEsperado: 100,
        },
      },
    };

    render(
      <DashboardCajeroView
        bloques={bloquesConCajaAnterior}
        onNavigate={onNavigate}
        renderBloqueError={() => null}
      />
    );

    expect(
      screen.getByText(/Hay una caja de un día anterior sin cerrar\. Ciérrela antes de abrir una nueva o cobrar\./i)
    ).toBeInTheDocument();

    const botonCerrarCaja = screen.getByRole('button', { name: /Cerrar Caja Anterior/i });
    expect(botonCerrarCaja).toBeInTheDocument();

    fireEvent.click(botonCerrarCaja);
    expect(onNavigate).toHaveBeenCalledWith('caja');
  });
});
