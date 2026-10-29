import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectorPedidoModal } from '../SelectorPedidoModal';
import { MesasPage } from '../../../pages/MesasPage';
import { PedidoMesaPage } from '../../../pages/PedidoMesaPage';
import type { PedidoAbiertoMesaDto } from '../../../types/pedido';
import type { UserSession } from '../../../types/auth';
import { pedidoService } from '../../../services/pedidoService';
import * as mesaService from '../../../services/mesaService';

vi.mock('../../../services/pedidoService', () => ({
  pedidoService: {
    obtenerPedidosActivosPorMesa: vi.fn(),
  },
}));

vi.mock('../../../services/mesaService', () => ({
  getMesasService: vi.fn(),
  crearMesaService: vi.fn(),
  actualizarMesaService: vi.fn(),
  cambiarEstadoMesaService: vi.fn(),
}));

vi.mock('../../../services/menuDiaService', () => ({
  menuDiaService: {
    obtenerMenuHoy: vi.fn().mockResolvedValue({ definido: true }),
  },
}));

describe('SelectorPedidoModal y Flujo de Selección en MesasPage', () => {
  const pedidosEjemplo: PedidoAbiertoMesaDto[] = [
    {
      id: 'ped-guid-1',
      numero: 101,
      estado: 'EnPreparacion',
      total: 45.5,
    },
    {
      id: 'ped-guid-2',
      numero: 102,
      estado: 'PorCobrar',
      total: 78.0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con 2 pedidos abiertos muestra número, estado y total de cada uno y no autoselecciona ninguno', () => {
    const onSeleccionarPedidoMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <SelectorPedidoModal
        isOpen={true}
        mesaNombre="Mesa 5"
        pedidos={pedidosEjemplo}
        onSeleccionarPedido={onSeleccionarPedidoMock}
        onClose={onCloseMock}
      />
    );

    // 1. Cabecera muestra título y cantidad de pedidos
    expect(screen.getByText(/Seleccionar Pedido · Mesa 5/i)).toBeInTheDocument();
    expect(screen.getByText(/La mesa tiene 2 pedidos abiertos/i)).toBeInTheDocument();

    // 2. Muestra número, estado y total de ambos pedidos
    expect(screen.getByText('Pedido N.º 101')).toBeInTheDocument();
    expect(screen.getByText('EnPreparacion')).toBeInTheDocument();
    expect(screen.getByText('S/ 45.50')).toBeInTheDocument();

    expect(screen.getByText('Pedido N.º 102')).toBeInTheDocument();
    expect(screen.getByText('PorCobrar')).toBeInTheDocument();
    expect(screen.getByText('S/ 78.00')).toBeInTheDocument();

    // 3. No autoselecciona ninguno por defecto
    expect(onSeleccionarPedidoMock).not.toHaveBeenCalled();

    // 4. Al hacer click en el segundo pedido, emite su ID correspondiente
    fireEvent.click(screen.getByText('Pedido N.º 102'));
    expect(onSeleccionarPedidoMock).toHaveBeenCalledTimes(1);
    expect(onSeleccionarPedidoMock).toHaveBeenCalledWith('ped-guid-2');
  });

  it('renderiza MesasPage con 1 solo pedido abierto en mesa ocupada y continúa directo sin mostrar modal selector', async () => {
    const mockSession: UserSession = {
      usuario: 'mozo1',
      rol: 'Mozo',
      nombre: 'Renzo Mozo',
      token: 'jwt-token-mozo',
    };

    const pedidoUnico: PedidoAbiertoMesaDto = {
      id: 'ped-guid-unico',
      numero: 105,
      estado: 'EnPreparacion',
      total: 32.0,
    };

    // 1. Mock de mesa ocupada cargada en MesasPage
    vi.mocked(mesaService.getMesasService).mockResolvedValue([
      {
        id: 'mesa-guid-1',
        nombre: 'Mesa 1',
        ocupacion: 'Ocupada',
        activa: true,
      },
    ]);

    // 2. Mock de pedidoService devolviendo exactamente 1 pedido activo para la mesa
    vi.mocked(pedidoService.obtenerPedidosActivosPorMesa).mockResolvedValue([pedidoUnico]);

    const onNavigateToPedidoMock = vi.fn();

    render(
      <MesasPage
        session={mockSession}
        onNavigateToPedido={onNavigateToPedidoMock}
      />
    );

    // 3. Esperar a que la mesa ocupada se renderice en pantalla
    await waitFor(() => {
      expect(screen.getByText('Mesa 1')).toBeInTheDocument();
    });

    // 4. Click en el botón de acción "Agregar productos" de la tarjeta de la mesa
    const btnAgregar = screen.getByRole('button', { name: /Agregar productos/i });
    fireEvent.click(btnAgregar);

    // 5. Verificación: continúa directo llamando a onNavigateToPedido con el pedido único
    await waitFor(() => {
      expect(onNavigateToPedidoMock).toHaveBeenCalledTimes(1);
      expect(onNavigateToPedidoMock).toHaveBeenCalledWith('mesa-guid-1', 'ampliacion', 'ped-guid-unico');
    });

    // 6. Verificación: el modal selector de pedidos NO se muestra
    expect(screen.queryByText(/Seleccionar Pedido · Mesa 1/i)).not.toBeInTheDocument();
  });

  it('redirige a Mesas y Salón y no muestra el formulario ni el catálogo si PedidoMesaPage se abre sin mesa seleccionada', async () => {
    const mockSession: UserSession = {
      usuario: 'mozo1',
      rol: 'Mozo',
      nombre: 'Renzo Mozo',
      token: 'jwt-token-mozo',
    };

    const onVolverAMesasMock = vi.fn();

    render(
      <PedidoMesaPage
        session={mockSession}
        mesaIdInicial={null}
        onLogout={vi.fn()}
        onVolverAMesas={onVolverAMesasMock}
      />
    );

    await waitFor(() => {
      expect(onVolverAMesasMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('Pedido de Mesa')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Buscar plato o bebida/i)).not.toBeInTheDocument();
  });
});
