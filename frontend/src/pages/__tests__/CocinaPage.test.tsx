import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CocinaPage } from '../CocinaPage';
import { comandaService } from '../../services/comandaService';
import type { UserSession } from '../../types/auth';

describe('CocinaPage - Pruebas de Caracterización y Pantalla KDS', () => {
  const mockSession: UserSession = {
    token: 'jwt-cocina',
    usuario: 'chef01',
    nombre: 'Gastón Cocinero',
    rol: 'Cocinero',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(comandaService, 'listarComandas').mockResolvedValue({
      items: [
        {
          id: 'cmd-301',
          pedidoNumero: 22,
          tipo: 'Mesa',
          mesa: 'Mesa 3',
          referencia: null,
          horaLlegada: '13:30',
          fechaHoraLlegadaUtc: '2026-10-30T18:30:00Z',
          estado: 'Pendiente',
          etiqueta: null,
          esAdicional: false,
          numeroAdicional: 0,
          modificada: false,
          registradoPor: 'Mario Mozo',
          minutosEspera: 5,
          esDemora: false,
          lineas: [
            {
              producto: 'Ají de Gallina',
              cantidad: 2,
              observacion: 'Sin aceituna',
            },
          ],
        },
      ],
      resumen: [
        {
          producto: 'Ají de Gallina',
          cantidad: 2,
        },
      ],
    });
  });

  it('debe renderizar el tablero de cocina KDS con comandas pendientes y coincidir con snapshot', async () => {
    const { container } = render(
      <CocinaPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cocina (KDS)' })).toBeInTheDocument();
    });

    expect(screen.getByText('Mesa 3')).toBeInTheDocument();
    expect(screen.getAllByText('Ají de Gallina').length).toBeGreaterThan(0);
    expect(container).toMatchSnapshot();
  });
});
