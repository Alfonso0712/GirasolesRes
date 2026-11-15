// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PedidoMesaView } from './PedidoMesaView';
import { ToastProvider } from '../../context/ToastContext';
import { pedidoService } from '../../services/pedidoService';
import { menuDiaService } from '../../services/menuDiaService';
import { ApiError } from '../../services/apiClient';
import { MAX_CANTIDAD_POR_LINEA } from '../../config/constantes';
import type { MesaItem } from '../../types/mesa';
import type { LineaBorrador, ProductoMenuPedidoDto } from '../../types/pedido';
import type { MenuDiaResponseDto } from '../../types/menuDia';

vi.mock('../../services/pedidoService', () => ({
  pedidoService: {
    obtenerCatalogoPedido: vi.fn(),
    obtenerPedidosActivosPorMesa: vi.fn(),
    registrarPedidoMesa: vi.fn(),
    agregarLineas: vi.fn(),
  },
}));

vi.mock('../../services/menuDiaService', () => ({
  menuDiaService: {
    obtenerMenuHoy: vi.fn(),
    obtenerMenuHoyCacheado: vi.fn().mockReturnValue(null),
  },
}));

vi.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ sinConexion: false }),
}));

const mesaLibreMock: MesaItem = {
  id: 'mesa-1',
  nombre: 'Mesa 01',
  ocupacion: 'Libre',
  activa: true,
};

const mesaOcupadaMock: MesaItem = {
  id: 'mesa-2',
  nombre: 'Mesa 02',
  ocupacion: 'Ocupada',
  activa: true,
};

const catalogoMock: ProductoMenuPedidoDto[] = [
  {
    id: 'prod-ceviche',
    nombre: 'Ceviche Clásico',
    categoria: 'Fondos',
    precio: 25,
    agotado: false,
    disponible: true,
    rol: null,
  },
  {
    id: 'prod-chicha',
    nombre: 'Chicha Morada',
    categoria: 'Bebidas',
    precio: 8,
    agotado: false,
    disponible: true,
    rol: null,
  },
  {
    id: 'prod-agotado',
    nombre: 'Arroz con Mariscos',
    categoria: 'Fondos',
    precio: 30,
    agotado: true,
    disponible: true,
    rol: null,
  },
  {
    id: 'prod-componente',
    nombre: 'Sopa Criolla',
    categoria: 'Sopas',
    precio: 0,
    agotado: false,
    disponible: true,
    rol: 'Sopa',
  },
];

const menuDiaDefinidoMock: MenuDiaResponseDto = {
  fecha: '2026-11-14',
  definido: true,
  platos: [],
  opciones: [],
  menusCompletos: [
    {
      id: 10,
      nombre: 'Menú Ejecutivo',
      precio: 16,
      incluye: 'Entrada + Segundo',
      disponible: true,
      partes: [
        {
          id: 1,
          nombre: 'Entrada',
          orden: 1,
          rolesPermitidos: ['Entrada'],
          opciones: [{ productoId: 'ent-1', nombre: 'Papa a la Huancaína', agotado: false }],
        },
        {
          id: 2,
          nombre: 'Segundo',
          orden: 2,
          rolesPermitidos: ['Segundo'],
          opciones: [{ productoId: 'seg-1', nombre: 'Seco de Res', agotado: false }],
        },
      ],
    },
  ],
};

const menuDiaNoDefinidoMock: MenuDiaResponseDto = {
  fecha: '2026-11-14',
  definido: false,
  platos: [],
  opciones: [],
  menusCompletos: [],
};

describe('PedidoMesaView — red de seguridad (Paso 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-14T12:00:00.000Z'));
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-4111-8111-111111111111');
    vi.mocked(menuDiaService.obtenerMenuHoyCacheado).mockReturnValue(null);
    vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue(menuDiaDefinidoMock);
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockResolvedValue(catalogoMock);
    vi.mocked(pedidoService.obtenerPedidosActivosPorMesa).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fotografía estado cargando', () => {
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <ToastProvider>
        <PedidoMesaView mesa={mesaLibreMock} onVolver={vi.fn()} onPedidoExitoso={vi.fn()} />
      </ToastProvider>
    );

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('fotografía catálogo con datos por rol Mozo (RV-154 sin montos y RN-140)', async () => {
    const { container } = render(
      <ToastProvider>
        <PedidoMesaView
          mesa={mesaLibreMock}
          rol="Mozo"
          onVolver={vi.fn()}
          onPedidoExitoso={vi.fn()}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ceviche Clásico')).toBeTruthy();
    });

    expect(screen.queryByText('Sopa Criolla')).toBeNull();
    expect(screen.queryByText('S/ 25.00')).toBeNull();
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('fotografía catálogo con datos por rol Administrador con montos y menú no definido', async () => {
    vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue(menuDiaNoDefinidoMock);

    const { container } = render(
      <ToastProvider>
        <PedidoMesaView
          mesa={mesaLibreMock}
          rol="Administrador"
          onVolver={vi.fn()}
          onPedidoExitoso={vi.fn()}
          onIrADefinirMenu={vi.fn()}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ceviche Clásico')).toBeTruthy();
    });

    expect(screen.getByText('S/ 25.00')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Definir menú/i })).toBeTruthy();
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('fotografía estado vacío', async () => {
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockResolvedValue([]);
    vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue(menuDiaNoDefinidoMock);

    const { container } = render(
      <ToastProvider>
        <PedidoMesaView mesa={mesaLibreMock} onVolver={vi.fn()} onPedidoExitoso={vi.fn()} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay productos disponibles')).toBeTruthy();
    });

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('fotografía estado error al fallar catálogo', async () => {
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockRejectedValue(
      new ApiError({ status: 500, mensaje: 'Error de red al consultar productos' })
    );

    const { container } = render(
      <ToastProvider>
        <PedidoMesaView mesa={mesaLibreMock} onVolver={vi.fn()} onPedidoExitoso={vi.fn()} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error de red al consultar productos')).toBeTruthy();
    });

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('flujo completo: agregar/quitar líneas, límite de cantidad, nota, menú completo, confirmar y enviar con payload exacto', async () => {
    const onPedidoExitoso = vi.fn();
    vi.mocked(pedidoService.registrarPedidoMesa).mockResolvedValue({
      pedidoId: 'ped-101',
      numero: 101,
      total: 516,
      comandaId: 'cmd-101',
    });

    const { container } = render(
      <ToastProvider>
        <PedidoMesaView
          mesa={mesaLibreMock}
          rol="Administrador"
          onVolver={vi.fn()}
          onPedidoExitoso={onPedidoExitoso}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ceviche Clásico')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Agregar Ceviche Clásico a la comanda/i }));

    for (let i = 1; i < MAX_CANTIDAD_POR_LINEA; i += 1) {
      fireEvent.click(
        screen.getAllByRole('button', { name: /Agregar uno más de Ceviche Clásico/i })[0]
      );
    }

    // Intentar superar el límite máximo por línea (20)
    fireEvent.click(
      screen.getAllByRole('button', { name: /Agregar uno más de Ceviche Clásico/i })[0]
    );
    expect(screen.getByText(`La cantidad máxima por línea es ${MAX_CANTIDAD_POR_LINEA}.`)).toBeTruthy();

    // Disminuir 1 unidad -> queda en 19
    fireEvent.click(screen.getAllByRole('button', { name: /Quitar uno de Ceviche Clásico/i })[0]);

    // Agregar nota de cocina a la línea
    fireEvent.click(screen.getByRole('button', { name: /Nota de cocina para Ceviche Clásico/i }));
    const textarea = screen.getByPlaceholderText(/Ej\. Sin sal/i);
    fireEvent.change(textarea, { target: { value: 'Sin picante' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Nota/i }));

    // Armar Menú Completo paso a paso
    fireEvent.click(screen.getByRole('button', { name: /Armar Menú Ejecutivo/i }));
    fireEvent.click(screen.getByText('Papa a la Huancaína'));
    fireEvent.click(screen.getByRole('button', { name: /^Siguiente$/i }));
    fireEvent.click(screen.getByText('Seco de Res'));
    fireEvent.click(screen.getByRole('button', { name: /Agregar al pedido/i }));

    expect(container.innerHTML).toMatchSnapshot();

    // Abrir confirmación y enviar
    fireEvent.click(screen.getByRole('button', { name: /Enviar Pedido a Cocina/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Enviar a cocina$/i }));

    await waitFor(() => {
      expect(pedidoService.registrarPedidoMesa).toHaveBeenCalledTimes(1);
    });

    expect(pedidoService.registrarPedidoMesa).toHaveBeenCalledWith({
      solicitudId: '11111111-1111-4111-8111-111111111111',
      mesaId: 'mesa-1',
      lineas: [
        {
          productoId: 'prod-ceviche',
          menuCompletoId: undefined,
          elecciones: undefined,
          cantidad: 19,
          observacion: 'Sin picante',
        },
        {
          productoId: undefined,
          menuCompletoId: 10,
          elecciones: [
            { parte: 'Entrada', productoId: 'ent-1' },
            { parte: 'Segundo', productoId: 'seg-1' },
          ],
          cantidad: 1,
          observacion: undefined,
        },
      ],
    });
    expect(onPedidoExitoso).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('girasoles_borrador_mesa_mesa-1')).toBeNull();
  });

  it('recupera borrador de sessionStorage y fotografía tras restaurar', async () => {
    const borrador: LineaBorrador[] = [
      {
        id: 'prod-prod-chicha-1',
        productoId: 'prod-chicha',
        nombre: 'Chicha Morada',
        precioUnitario: 8,
        cantidad: 2,
        observacion: 'Sin hielo',
        subtotal: 16,
      },
    ];
    sessionStorage.setItem('girasoles_borrador_mesa_mesa-1', JSON.stringify(borrador));

    const { container } = render(
      <ToastProvider>
        <PedidoMesaView mesa={mesaLibreMock} rol="Mozo" onVolver={vi.fn()} onPedidoExitoso={vi.fn()} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tiene un pedido sin registrar/i)).toBeTruthy();
    });

    expect(container.innerHTML).toMatchSnapshot();

    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    await waitFor(() => {
      expect(screen.getByText('Se restauró el pedido guardado para esta mesa.')).toBeTruthy();
    });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('flujo de ampliación en mesa ocupada envía agregarLineas con payload exacto', async () => {
    const onPedidoExitoso = vi.fn();
    vi.mocked(pedidoService.obtenerPedidosActivosPorMesa).mockResolvedValue([
      { id: 'ped-42', numero: 42, estado: 'Pendiente', total: 25 },
    ]);
    vi.mocked(pedidoService.agregarLineas).mockResolvedValue({
      total: 33,
      comandaId: 'cmd-42-2',
      numeroPedido: 42,
    });

    const { container } = render(
      <ToastProvider>
        <PedidoMesaView
          mesa={mesaOcupadaMock}
          rol="Mozo"
          onVolver={vi.fn()}
          onPedidoExitoso={onPedidoExitoso}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ampliar pedido N.º 42')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Agregar Chicha Morada a la comanda/i }));
    expect(container.innerHTML).toMatchSnapshot();

    fireEvent.click(screen.getByRole('button', { name: /Enviar Ampliación a Cocina/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Enviar ampliación$/i }));

    await waitFor(() => {
      expect(pedidoService.agregarLineas).toHaveBeenCalledTimes(1);
    });

    expect(pedidoService.agregarLineas).toHaveBeenCalledWith('ped-42', {
      solicitudId: '11111111-1111-4111-8111-111111111111',
      lineas: [
        {
          productoId: 'prod-chicha',
          menuCompletoId: undefined,
          elecciones: undefined,
          cantidad: 1,
          observacion: undefined,
        },
      ],
    });
    expect(onPedidoExitoso).toHaveBeenCalledTimes(1);
  });
});
