import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
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
    expect(screen.getByRole('heading', { name: 'Productos' })).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('las pestañas tienen roles ARIA, aria-selected y responden a las flechas del teclado', async () => {
    render(<ProductsPage session={mockSession} onLogout={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('tablist', { name: /Pestañas de productos/i })).toBeInTheDocument();
    });

    const tabCatalogo = screen.getByRole('tab', { name: /Productos y Componentes/i });
    const tabMenus = screen.getByRole('tab', { name: /Menús completos/i });

    expect(tabCatalogo).toHaveAttribute('aria-selected', 'true');
    expect(tabCatalogo).toHaveAttribute('tabindex', '0');
    expect(tabMenus).toHaveAttribute('aria-selected', 'false');
    expect(tabMenus).toHaveAttribute('tabindex', '-1');

    // Navegación con flecha derecha
    act(() => {
      fireEvent.keyDown(tabCatalogo, { key: 'ArrowRight' });
    });
    expect(tabMenus).toHaveAttribute('aria-selected', 'true');
    expect(tabMenus).toHaveAttribute('tabindex', '0');
    expect(tabCatalogo).toHaveAttribute('aria-selected', 'false');
    expect(tabCatalogo).toHaveAttribute('tabindex', '-1');

    // Navegación con flecha izquierda
    act(() => {
      fireEvent.keyDown(tabMenus, { key: 'ArrowLeft' });
    });
    expect(tabCatalogo).toHaveAttribute('aria-selected', 'true');
  });
});
