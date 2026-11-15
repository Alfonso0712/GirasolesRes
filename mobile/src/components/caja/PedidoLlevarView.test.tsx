// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PedidoLlevarView } from './PedidoLlevarView';
import { ToastProvider } from '../../context/ToastContext';
import { pedidoService } from '../../services/pedidoService';
import { menuDiaService } from '../../services/menuDiaService';
import { MAX_CANTIDAD_POR_LINEA } from '../../config/constantes';
import type { ProductoMenuPedidoDto } from '../../types/pedido';
import type { MenuDiaResponseDto } from '../../types/menuDia';

vi.mock('../../services/pedidoService', () => ({
  pedidoService: {
    obtenerCatalogoPedido: vi.fn(),
    registrarPedidoLlevar: vi.fn(),
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

describe('PedidoLlevarView — red de seguridad (Paso 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-14T12:00:00.000Z'));
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('22222222-2222-4222-8222-222222222222');
    vi.mocked(menuDiaService.obtenerMenuHoyCacheado).mockReturnValue(null);
    vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue(menuDiaDefinidoMock);
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockResolvedValue(catalogoMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fotografía estado cargando', () => {
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <ToastProvider>
        <PedidoLlevarView onPedidoCreado={vi.fn()} />
      </ToastProvider>
    );

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('fotografía estado con datos para Cajero (con precios, menús y exclusión RN-140)', async () => {
    const { container } = render(
      <ToastProvider>
        <PedidoLlevarView onPedidoCreado={vi.fn()} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ceviche Clásico')).toBeTruthy();
    });

    expect(screen.queryByText('Sopa Criolla')).toBeNull();
    expect(screen.getByText('S/ 25.00')).toBeTruthy();
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('fotografía estado vacío', async () => {
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockResolvedValue([]);
    vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue(menuDiaNoDefinidoMock);

    const { container } = render(
      <ToastProvider>
        <PedidoLlevarView onPedidoCreado={vi.fn()} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay productos disponibles')).toBeTruthy();
    });

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('fotografía estado error al fallar catálogo', async () => {
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockRejectedValue(
      new Error('Error al cargar catálogo para llevar')
    );

    const { container } = render(
      <ToastProvider>
        <PedidoLlevarView onPedidoCreado={vi.fn()} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error al cargar catálogo para llevar')).toBeTruthy();
    });

    expect(container.innerHTML).toMatchSnapshot();
  });

  it('flujo completo: referencia obligatoria, agregar/quitar líneas, límite, nota, menú completo y envío exacto', async () => {
    const onPedidoCreado = vi.fn();
    const onIrACobros = vi.fn();
    vi.mocked(pedidoService.registrarPedidoLlevar).mockResolvedValue({
      pedidoId: 'ped-l-55',
      numero: 55,
      total: 41,
      comandaId: 'cmd-l-55',
    });

    const { container } = render(
      <ToastProvider>
        <PedidoLlevarView onPedidoCreado={onPedidoCreado} onIrACobros={onIrACobros} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ceviche Clásico')).toBeTruthy();
    });

    // Agregar Chicha y validar límite por línea
    fireEvent.click(screen.getByRole('button', { name: /Agregar Chicha Morada al pedido/i }));
    for (let i = 1; i < MAX_CANTIDAD_POR_LINEA; i += 1) {
      fireEvent.click(
        screen.getAllByRole('button', { name: /Agregar uno más de Chicha Morada/i })[0]
      );
    }
    fireEvent.click(
      screen.getAllByRole('button', { name: /Agregar uno más de Chicha Morada/i })[0]
    );
    expect(screen.getByText(`La cantidad máxima por línea es ${MAX_CANTIDAD_POR_LINEA}.`)).toBeTruthy();

    // Quitar hasta 19 y agregar nota
    fireEvent.click(screen.getAllByRole('button', { name: /Quitar uno de Chicha Morada/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Nota de cocina para Chicha Morada/i }));
    fireEvent.change(screen.getByPlaceholderText(/Ej\. Sin sal/i), {
      target: { value: 'Poco hielo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Nota/i }));

    // Armar Menú Ejecutivo
    fireEvent.click(screen.getByRole('button', { name: /Armar Menú Ejecutivo/i }));
    fireEvent.click(screen.getByText('Papa a la Huancaína'));
    fireEvent.click(screen.getByRole('button', { name: /^Siguiente$/i }));
    fireEvent.click(screen.getByText('Seco de Res'));
    fireEvent.click(screen.getByRole('button', { name: /Agregar al pedido/i }));

    // Con referencia < 2 caracteres el botón Confirmar queda deshabilitado
    const btnConfirmar = screen.getByRole('button', { name: /Confirmar Pedido para Llevar/i });
    expect(btnConfirmar).toBeDisabled();

    // Ingresar referencia válida
    const inputRef = screen.getByLabelText(/Cliente \/ Referencia/i);
    fireEvent.change(inputRef, { target: { value: '  Juan Perez  ' } });

    expect(btnConfirmar).not.toBeDisabled();
    expect(container.innerHTML).toMatchSnapshot();

    fireEvent.click(btnConfirmar);
    fireEvent.click(screen.getByRole('button', { name: /Registrar y enviar/i }));

    await waitFor(() => {
      expect(pedidoService.registrarPedidoLlevar).toHaveBeenCalledTimes(1);
    });

    expect(pedidoService.registrarPedidoLlevar).toHaveBeenCalledWith({
      solicitudId: '22222222-2222-4222-8222-222222222222',
      referencia: 'Juan Perez',
      lineas: [
        {
          productoId: 'prod-chicha',
          menuCompletoId: undefined,
          elecciones: undefined,
          cantidad: 19,
          observacion: 'Poco hielo',
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
    expect(onPedidoCreado).toHaveBeenCalledTimes(1);
    expect(onIrACobros).toHaveBeenCalledTimes(1);
  });
});
