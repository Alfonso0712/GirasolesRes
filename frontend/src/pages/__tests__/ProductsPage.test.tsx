import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductsPage } from '../ProductsPage';
import * as productoService from '../../services/productoService';
import * as menuCompletoService from '../../services/menuCompletoService';
import type { UserSession } from '../../types/auth';

describe('ProductsPage - Pruebas de Caracterización y Catálogo', () => {
  const mockSession: UserSession = {
    token: 'fake-jwt',
    usuario: 'admin',
    nombre: 'Administrador General',
    rol: 'Administrador',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(productoService, 'getProductosService').mockResolvedValue({
      items: [
        {
          id: 'prod-01',
          nombre: 'Lomo Saltado Criollo',
          tipo: 'Carta',
          categoria: 'PlatosExtras',
          precio: 36.0,
          activo: true,
        },
        {
          id: 'prod-02',
          nombre: 'Sopa de Casa',
          tipo: 'Componente',
          rol: 'Entrada',
          categoria: 'Almuerzo',
          precio: 8.0,
          activo: true,
        },
      ],
      total: 2,
    });

    vi.spyOn(menuCompletoService, 'getMenusCompletosService').mockResolvedValue([
      {
        id: 1,
        nombre: 'Menú Completo Diario',
        precio: 18.0,
        activo: true,
        partes: [],
      },
    ]);
  });

  it('debe renderizar el catálogo con productos y coincidir con snapshot', async () => {
    const { container } = render(
      <ProductsPage session={mockSession} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Lomo Saltado Criollo')).toBeInTheDocument();
    });

    expect(screen.getByText('Sopa de Casa')).toBeInTheDocument();
    expect(screen.getByText('Carta y Menús')).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
});
