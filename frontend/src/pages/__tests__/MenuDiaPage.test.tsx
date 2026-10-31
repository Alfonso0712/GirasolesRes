import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MenuDiaPage } from '../MenuDiaPage';
import { menuDiaService } from '../../services/menuDiaService';
import type { UserSession } from '../../types/auth';

describe('MenuDiaPage - Pruebas de Caracterización y Menú Diario', () => {
  const mockSession: UserSession = {
    token: 'jwt-menu',
    usuario: 'admin',
    nombre: 'Admin Cocina',
    rol: 'Administrador',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(menuDiaService, 'obtenerMenuHoy').mockResolvedValue({
      fecha: '2026-10-30',
      definido: true,
      desayuno: null,
      platos: [
        {
          productoId: 'p-1',
          nombre: 'Lomo Saltado',
          categoria: 'PlatosExtras',
          precio: 35.0,
          agotado: false,
        },
      ],
      opciones: [
        {
          productoId: 'p-2',
          nombre: 'Papa a la Huancaína',
          rol: 'Entrada',
          agotado: false,
        },
      ],
      menusCompletos: [
        {
          id: 1,
          nombre: 'Menú Ejecutivo Criollo',
          precio: 20.0,
          incluye: 'Chicha morada',
          disponible: true,
          partes: [],
        },
      ],
    });

    vi.spyOn(menuDiaService, 'obtenerCandidatos').mockResolvedValue([
      {
        id: 'p-2',
        nombre: 'Papa a la Huancaína',
        tipo: 'Componente',
        rol: 'Entrada',
        categoria: null,
        precio: null,
      },
    ]);
  });

  it('debe renderizar la pantalla del menú del día y coincidir con snapshot', async () => {
    const { container } = render(
      <MenuDiaPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Menú del Día/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Papa a la Huancaína/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
