import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PedidosPage } from '../PedidosPage';
import { pedidoService } from '../../services/pedidoService';
import * as mesaService from '../../services/mesaService';
import type { UserSession } from '../../types/auth';

describe('PedidosPage - Pruebas de Caracterización y Lista de Pedidos', () => {
  const mockSession: UserSession = {
    token: 'jwt-pedidos',
    usuario: 'mozo01',
    nombre: 'Mario Mozo',
    rol: 'Mozo',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.setSystemTime(new Date('2026-10-30T15:00:00-05:00'));
    vi.spyOn(mesaService, 'getMesasService').mockResolvedValue([
      { id: 'm-1', nombre: 'Mesa 1', activa: true, ocupacion: 'Libre' },
    ]);

    vi.spyOn(pedidoService, 'listarPedidos').mockResolvedValue({
      items: [
        {
          id: 'ped-201',
          numero: 15,
          tipo: 'Mesa',
          mesa: 'Mesa 1',
          referencia: null,
          hora: '14:20',
          total: 84.0,
          estado: 'enPreparacion',
          registradoPor: 'Mario Mozo',
          usuarioId: 'u2',
          esMio: true,
          puedeModificar: false,
          puedeAnular: false,
          motivoDeshabilitado: null,
        },
      ],
      total: 1,
      resumen: {
        pendiente: 0,
        enPreparacion: 1,
        listo: 0,
        pagado: 0,
        anulado: 0,
      },
    });
  });

  it('debe renderizar el listado de pedidos y coincidir con snapshot', async () => {
    const { container } = render(
      <PedidosPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pedidos' })).toBeInTheDocument();
    });

    expect(screen.getAllByText('Mesa 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/84\.00/).length).toBeGreaterThan(0);
    expect(container).toMatchSnapshot();
  });
});
