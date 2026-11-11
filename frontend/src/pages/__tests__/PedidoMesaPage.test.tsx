import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PedidoMesaPage } from '../PedidoMesaPage';
import { pedidoService } from '../../services/pedidoService';
import * as mesaService from '../../services/mesaService';
import { menuDiaService } from '../../services/menuDiaService';
import * as menuCompletoService from '../../services/menuCompletoService';
import type { UserSession } from '../../types/auth';

describe('PedidoMesaPage - Pruebas de Caracterización y Toma de Pedidos', () => {
  const mockSession: UserSession = {
    token: 'jwt-pedido-mesa',
    usuario: 'mozo01',
    nombre: 'Mario Mozo',
    rol: 'Mozo',
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
      } as any,
    ]);

    vi.spyOn(pedidoService, 'obtenerCatalogoPedido').mockResolvedValue([
      {
        id: 'prod-1',
        nombre: 'Ceviche Clásico',
        precio: 32.0,
        categoria: 'Entradas',
        agotado: false,
      } as any,
    ]);

    vi.spyOn(menuDiaService, 'obtenerMenuHoy').mockResolvedValue({
      menusCompletos: [],
    } as any);

    vi.spyOn(menuCompletoService, 'getMenusCompletosService').mockResolvedValue([]);
  });

  it('debe renderizar la toma de pedido con mesa seleccionada y coincidir con snapshot', async () => {
    const { container } = render(
      <PedidoMesaPage
        session={mockSession}
        mesaIdInicial="m-1"
        onLogout={vi.fn()}
        onVolverAMesas={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pedido de Mesa' })).toBeInTheDocument();
    });

    expect(screen.getAllByText('Mesa 1').length).toBeGreaterThan(0);
    expect(screen.getByText('Ceviche Clásico')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
