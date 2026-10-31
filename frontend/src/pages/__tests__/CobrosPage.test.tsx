import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CobrosPage } from '../CobrosPage';
import { cajaService } from '../../services/cajaService';
import { cobroService } from '../../services/cobroService';
import type { UserSession } from '../../types/auth';

describe('CobrosPage - Pruebas de Caracterización y Módulo de Cobros', () => {
  const mockSession: UserSession = {
    token: 'jwt-cobros',
    usuario: 'cajero01',
    nombre: 'Elena Cajera',
    rol: 'Cajero',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(cajaService, 'obtenerActual').mockResolvedValue({
      estado: 'abierta',
      apertura: {
        cajaId: 'caja-1',
        fechaApertura: '2026-10-30T08:00:00Z',
        fechaAperturaLocal: '30/10/2026 03:00',
        montoInicial: 100.0,
        idUsuarioApertura: 'u1',
        nombreUsuarioApertura: 'Elena Cajera',
      },
      resumenParcial: {
        totalVentas: 250.0,
        totalEfectivo: 150.0,
        totalYape: 100.0,
        cantidadVentas: 5,
      },
      sugerenciaMontoInicial: 100.0,
    });

    vi.spyOn(cobroService, 'obtenerPedidosPendientes').mockResolvedValue([
      {
        pedidoId: 'ped-101',
        numero: 12,
        tipo: 'Mesa',
        mesa: 'Mesa 4',
        mesaId: 'm4',
        referencia: null,
        hora: '13:45',
        estado: 'listo',
        total: 65.5,
        estaListo: true,
      },
    ]);
  });

  it('debe renderizar el listado de pedidos por cobrar con caja abierta y coincidir con snapshot', async () => {
    const { container } = render(
      <CobrosPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cobro de Pedidos' })).toBeInTheDocument();
    });

    expect(screen.getByText('Mesa 4')).toBeInTheDocument();
    expect(screen.getAllByText(/65\.50/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Caja abierta · Elena Cajera/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
