import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VentasPage } from '../VentasPage';
import { ventaService } from '../../services/ventaService';
import type { UserSession } from '../../types/auth';

describe('VentasPage - Pruebas de Caracterización y Lista de Ventas', () => {
  const mockSession: UserSession = {
    token: 'jwt-ventas',
    usuario: 'cajero01',
    nombre: 'Elena Cajera',
    rol: 'Cajero',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.setSystemTime(new Date('2026-10-30T15:00:00-05:00'));
    vi.spyOn(ventaService, 'listarVentas').mockResolvedValue({
      items: [
        {
          ventaId: 'v-1',
          comprobante: 'B001-000012',
          fechaHora: '2026-10-30T13:00:00Z',
          fechaHoraFormateada: '30/10/2026 13:00',
          pedidoNumero: 10,
          tipo: 'Mesa',
          mesa: 'Mesa 2',
          total: 58.0,
          metodo: 'Efectivo',
          cajero: 'Elena Cajera',
          estado: 'Vigente',
        },
      ],
      total: 1,
      pagina: 1,
      tamano: 10,
      resumen: {
        vigentes: 1,
        totalVigente: 58.0,
        efectivo: 58.0,
        yape: 0.0,
        anuladas: 0,
      },
    });
  });

  it('debe renderizar el historial de ventas y coincidir con snapshot', async () => {
    const { container } = render(
      <VentasPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('B001-000012')).toBeInTheDocument();
    });

    expect(screen.getByText('Mesa 2')).toBeInTheDocument();
    expect(screen.getAllByText('S/ 58.00').length).toBeGreaterThan(0);
    expect(container).toMatchSnapshot();
  });
});
