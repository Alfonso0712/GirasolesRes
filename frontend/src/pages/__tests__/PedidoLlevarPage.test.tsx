import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PedidoLlevarPage } from '../PedidoLlevarPage';
import { pedidoService } from '../../services/pedidoService';
import { menuDiaService } from '../../services/menuDiaService';
import * as menuCompletoService from '../../services/menuCompletoService';
import type { UserSession } from '../../types/auth';

describe('PedidoLlevarPage - Pruebas de Caracterización y Pedidos para Llevar', () => {
  const mockSession: UserSession = {
    token: 'jwt-pedido-llevar',
    usuario: 'cajero01',
    nombre: 'Elena Cajera',
    rol: 'Cajero',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(pedidoService, 'obtenerCatalogoPedido').mockResolvedValue([
      {
        id: 'prod-10',
        nombre: 'Arroz con Pollo',
        precio: 28.0,
        categoria: 'Segundos',
        agotado: false,
      } as any,
    ]);

    vi.spyOn(menuDiaService, 'obtenerMenuHoy').mockResolvedValue({
      menusCompletos: [],
    } as any);

    vi.spyOn(menuCompletoService, 'getMenusCompletosService').mockResolvedValue([]);
  });

  it('debe renderizar el catálogo para llevar con campo de referencia y coincidir con snapshot', async () => {
    const { container } = render(
      <PedidoLlevarPage session={mockSession} onLogout={vi.fn()} onVolver={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pedido para Llevar' })).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Referencia cliente/i)).toBeInTheDocument();
    expect(screen.getByText('Arroz con Pollo')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
