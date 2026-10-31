import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HistorialCierresPage } from '../HistorialCierresPage';
import { cajaService } from '../../services/cajaService';
import type { UserSession } from '../../types/auth';

describe('HistorialCierresPage - Pruebas de Caracterización de Cierres', () => {
  const mockSession: UserSession = {
    token: 'jwt-cierres',
    usuario: 'admin01',
    nombre: 'Admin General',
    rol: 'Administrador',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.setSystemTime(new Date('2026-10-30T15:00:00-05:00'));
    vi.spyOn(cajaService, 'obtenerHistorialCierres').mockResolvedValue({
      items: [
        {
          cajaId: 'caja-100',
          fechaApertura: '2026-10-30T08:00:00Z',
          fechaAperturaLocal: '30/10/2026 03:00',
          fechaCierre: '2026-10-30T16:00:00Z',
          fechaCierreLocal: '30/10/2026 11:00',
          cajero: 'Elena Cajera',
          montoInicial: 100.0,
          efectivo: 350.0,
          yape: 150.0,
          total: 500.0,
          efectivoContado: 350.0,
          diferencia: 0.0,
          estado: 'Cerrada',
          conAjustes: false,
        },
      ],
      total: 1,
      pagina: 1,
      tamano: 10,
      totalPaginas: 1,
    });
  });

  it('debe renderizar el listado de cierres históricos y coincidir con snapshot', async () => {
    const { container } = render(
      <HistorialCierresPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Historial de Cierres/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Elena Cajera')).toBeInTheDocument();
    expect(screen.getByText('S/ 500.00')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
