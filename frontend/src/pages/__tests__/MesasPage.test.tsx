import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MesasPage } from '../MesasPage';
import * as mesaService from '../../services/mesaService';
import { menuDiaService } from '../../services/menuDiaService';
import type { UserSession } from '../../types/auth';

describe('MesasPage - Pruebas de Caracterización y Salón de Mesas', () => {
  const mockSession: UserSession = {
    token: 'jwt-mesas',
    usuario: 'admin01',
    nombre: 'Carlos Admin',
    rol: 'Administrador',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mesaService, 'getMesasService').mockResolvedValue([
      {
        id: 'm-1',
        numero: 1,
        nombre: 'Mesa 1',
        capacidad: 4,
        activa: true,
        ocupacion: 'Libre',
        totalVentaActual: 0,
        pedidosActivosCount: 0,
      } as any,
      {
        id: 'm-2',
        numero: 2,
        nombre: 'Mesa 2',
        capacidad: 6,
        activa: true,
        ocupacion: 'Ocupada',
        totalVentaActual: 58.0,
        pedidosActivosCount: 1,
      } as any,
    ]);

    vi.spyOn(menuDiaService, 'obtenerMenuHoy').mockResolvedValue({
      definido: true,
      fecha: '2026-10-30',
      desayuno: null,
      platos: [],
      opciones: [],
      menusCompletos: [],
    });
  });

  it('debe renderizar la grilla de mesas con estado libres/ocupadas y coincidir con snapshot', async () => {
    const { container } = render(
      <MesasPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Mesas' })).toBeInTheDocument();
    });

    expect(screen.getByText('Mesa 1')).toBeInTheDocument();
    expect(screen.getByText('Mesa 2')).toBeInTheDocument();
    expect(screen.getByText(/Libres 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Ocupadas 1/i)).toBeInTheDocument();
    expect(screen.getByText('Nueva mesa')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
