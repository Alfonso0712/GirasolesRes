import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HomePage } from '../HomePage';
import { cajaService } from '../../services/cajaService';
import { comandaService } from '../../services/comandaService';
import { pedidoService } from '../../services/pedidoService';
import { inicioService } from '../../services/inicioService';
import type { UserSession } from '../../types/auth';

describe('HomePage - Pruebas de Caracterización y Layout Principal', () => {
  const mockSession: UserSession = {
    token: 'jwt-home',
    usuario: 'admin01',
    nombre: 'Carlos Admin',
    rol: 'Administrador',
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
        nombreUsuarioApertura: 'Carlos Admin',
      },
      resumenParcial: {
        totalVentas: 300.0,
        totalEfectivo: 200.0,
        totalYape: 100.0,
        cantidadVentas: 8,
      },
      sugerenciaMontoInicial: 100.0,
    });

    vi.spyOn(comandaService, 'listarComandas').mockResolvedValue({
      comandas: [],
      total: 0,
    } as any);

    vi.spyOn(pedidoService, 'obtenerAvisosPendientes').mockResolvedValue([]);

    vi.spyOn(inicioService, 'obtenerInicio').mockResolvedValue({
      rol: 'Administrador',
      fecha: '2026-10-30',
      bloques: {
        ventasHoy: {
          estado: 'ok',
          datos: {
            nVentas: 8,
            total: 300.0,
            efectivo: 200.0,
            yape: 100.0,
          },
        },
      },
    });
  });

  it('debe renderizar el marco principal, cabecera y coincidir con snapshot', async () => {
    const { container } = render(
      <HomePage
        session={mockSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Carlos Admin/i)).toBeInTheDocument();
    });

    expect(screen.getByAltText(/Girasoles Restaurante/i)).toBeInTheDocument();
    expect(screen.getByText(/Salón y Pedidos/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
