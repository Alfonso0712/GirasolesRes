import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ReportesPage } from '../ReportesPage';
import { reporteService } from '../../services/reporteService';
import type { UserSession } from '../../types/auth';

describe('ReportesPage - Pruebas de Caracterización y Reportes Gerenciales', () => {
  const mockSession: UserSession = {
    token: 'jwt-rep',
    usuario: 'gerente',
    nombre: 'Gerencia General',
    rol: 'Administrador',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(reporteService, 'obtenerReportePlatos').mockResolvedValue({
      totalPlatos: 15,
      totalMonto: 450.0,
      totalVentas: 450.0,
      coincide: true,
      subtotales: [],
      items: [
        {
          productoId: 'p-1',
          producto: 'Lomo Saltado',
          categoria: 'PlatosExtras',
          activo: true,
          cantidad: 15,
          monto: 450.0,
        },
      ],
      porDia: [],
    });

    vi.spyOn(reporteService, 'obtenerReporteVentas').mockResolvedValue({
      desde: '2026-10-01',
      hasta: '2026-10-30',
      nVentas: 25,
      total: 1250.0,
      efectivo: 750.0,
      yape: 500.0,
      anuladas: { cantidad: 1, monto: 45.0 },
      porDia: [
        {
          fecha: '2026-10-30',
          nVentas: 25,
          efectivo: 750.0,
          yape: 500.0,
          total: 1250.0,
          conAjustes: false,
        },
      ],
    });
  });

  it('debe renderizar la pantalla de reportes y coincidir con snapshot', async () => {
    const { container } = render(
      <ReportesPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Reportes' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /CONSULTAR/i }));

    await waitFor(() => {
      expect(screen.getByText('Lomo Saltado')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
