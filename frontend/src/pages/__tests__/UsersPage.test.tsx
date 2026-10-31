import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UsersPage } from '../UsersPage';
import * as usuarioService from '../../services/usuarioService';
import type { UserSession } from '../../types/auth';

describe('UsersPage - Pruebas de Caracterización y Gestión de Usuarios', () => {
  const mockSession: UserSession = {
    token: 'jwt-users',
    usuario: 'admin01',
    nombre: 'Admin Master',
    rol: 'Administrador',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(usuarioService, 'getUsuariosService').mockResolvedValue({
      items: [
        {
          id: 'u-1',
          nombre: 'Elena Cajera',
          usuario: 'elena.cajera',
          correo: 'elena@girasoles.pe',
          rol: 'Cajero',
          activo: true,
          fechaCreacion: '2026-01-15T10:00:00Z',
        },
      ],
      total: 1,
    });
  });

  it('debe renderizar el listado de usuarios y coincidir con snapshot', async () => {
    const { container } = render(
      <UsersPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Elena Cajera')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('@elena.cajera')).toBeInTheDocument();
    expect(screen.getByText('Nuevo usuario')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
