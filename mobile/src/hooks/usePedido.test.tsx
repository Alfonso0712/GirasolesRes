import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBorradorStorage } from './useBorradorStorage';
import { usePedidoMesa } from './usePedidoMesa';
import { usePedidoLlevar } from './usePedidoLlevar';
import { pedidoService } from '../services/pedidoService';
import { menuDiaService } from '../services/menuDiaService';
import type { MesaItem } from '../types/mesa';

const { mostrarToastMock } = vi.hoisted(() => ({ mostrarToastMock: vi.fn() }));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ mostrar: mostrarToastMock }),
}));

vi.mock('./useNetworkStatus', () => ({
  useNetworkStatus: () => ({ sinConexion: false }),
}));

vi.mock('./useHaptics', () => ({
  useHaptics: () => ({
    triggerLight: vi.fn(),
    triggerSuccess: vi.fn(),
    triggerError: vi.fn(),
  }),
}));

vi.mock('./useBackHandler', () => ({
  useBackHandler: vi.fn(),
}));

vi.mock('../services/pedidoService', () => ({
  pedidoService: {
    obtenerCatalogoPedido: vi.fn(),
    obtenerPedidosActivosPorMesa: vi.fn(),
    registrarPedidoMesa: vi.fn(),
    registrarPedidoLlevar: vi.fn(),
    agregarLineas: vi.fn(),
  },
}));

vi.mock('../services/menuDiaService', () => ({
  menuDiaService: {
    obtenerMenuHoy: vi.fn(),
    obtenerMenuHoyCacheado: vi.fn(() => null),
  },
}));

const MESA_BASE: MesaItem = { id: 'm-1', nombre: 'Mesa 1', numero: 1, estado: 'Activa', ocupacion: 'Libre' };

describe('hooks de pedido (useBorradorStorage, usePedidoMesa, usePedidoLlevar)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(pedidoService.obtenerCatalogoPedido).mockResolvedValue([
      { id: 'p1', nombre: 'Ceviche', categoria: 'Entradas de Carta', precio: 25, disponible: true, agotado: false, rol: null },
      { id: 'p2', nombre: 'Arroz con Pollo', categoria: 'Segundos de Carta', precio: 22, disponible: true, agotado: true, rol: null },
    ]);
    vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue({
      fecha: '2026-11-14',
      definido: true,
      esFindeOFeriado: false,
      menusCompletos: [],
      grupos: [],
    });
  });

  it('useBorradorStorage ignora JSON inválido en sessionStorage', () => {
    sessionStorage.setItem('bad-draft', '{malformed');
    const { result } = renderHook(() => useBorradorStorage('bad-draft'));
    expect(result.current.hayBorradorGuardado).toBe(false);
    expect(result.current.borradorRecuperado).toBeNull();
  });

  it('usePedidoMesa maneja error 103 (platos agotados), error 115 en ampliación y descarte de borrador', async () => {
    const onVolver = vi.fn();
    const { result } = renderHook(() =>
      usePedidoMesa({ mesa: MESA_BASE, rol: 'Administrador', onVolver, onPedidoExitoso: vi.fn() })
    );
    await waitFor(() => expect(result.current.catalogo).toHaveLength(2));

    act(() => {
      result.current.agregarProducto({ id: 'p2', nombre: 'Agotado', categoria: 'Carta', precio: 10, disponible: false, agotado: true, rol: null });
      result.current.agregarProducto({ id: 'p1', nombre: 'Ceviche', categoria: 'Carta', precio: 25, disponible: true, agotado: false, rol: null });
    });
    expect(result.current.lineas).toHaveLength(1);
    act(() => result.current.solicitarEnvioComanda());
    expect(result.current.mostrarConfirmEnviar).toBe(true);

    vi.mocked(pedidoService.registrarPedidoMesa).mockRejectedValueOnce(new Error('Error 103: producto agotado'));
    await act(async () => {
      await result.current.ejecutarEnvioComanda();
    });
    expect(result.current.errorEnvio).toContain('103');
    expect(mostrarToastMock).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'error' }));

    act(() => result.current.solicitarVolver());
    expect(result.current.mostrarConfirmDescartar).toBe(true);
    act(() => result.current.descartarYVolver());
    expect(onVolver).toHaveBeenCalled();
  });

  it('usePedidoMesa notifica si ampliación falla con código 115 (en preparación)', async () => {
    vi.mocked(pedidoService.obtenerPedidosActivosPorMesa).mockResolvedValueOnce([
      { id: 'ped-1', numero: 99, total: 20, estado: 'EnPreparacion', fecha: '2026-11-14', detalles: [] },
    ]);
    const mesaOcupada: MesaItem = { ...MESA_BASE, ocupacion: 'Ocupada' };
    const { result } = renderHook(() =>
      usePedidoMesa({ mesa: mesaOcupada, rol: 'Mozo', onVolver: vi.fn(), onPedidoExitoso: vi.fn() })
    );
    await waitFor(() => expect(result.current.esAmpliacion).toBe(true));

    act(() => {
      result.current.agregarProducto({ id: 'p1', nombre: 'Ceviche', categoria: 'Carta', precio: 25, disponible: true, agotado: false, rol: null });
    });
    vi.mocked(pedidoService.agregarLineas).mockRejectedValueOnce(new Error('Código 115: en preparación'));
    await act(async () => {
      await result.current.ejecutarEnvioComanda();
    });
    expect(result.current.errorEnvio).toContain('115');
    expect(mostrarToastMock).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'error' }));
  });

  it('usePedidoLlevar valida referencia inválida, error de envío 103 y descartarPedido', async () => {
    const { result } = renderHook(() =>
      usePedidoLlevar({ onPedidoCreado: vi.fn(), onIrACobros: vi.fn() })
    );
    await waitFor(() => expect(result.current.catalogo).toHaveLength(2));

    act(() => {
      result.current.agregarProducto({ id: 'p1', nombre: 'Ceviche', categoria: 'Carta', precio: 25, disponible: true, agotado: false, rol: null });
      result.current.cambiarReferencia('A');
    });
    act(() => result.current.solicitarRegistroPedido());
    expect(result.current.mostrarConfirmEnviar).toBe(false);
    expect(result.current.errorEnvio).toContain('entre 2 y 30');

    act(() => result.current.cambiarReferencia('Juan'));
    vi.mocked(pedidoService.registrarPedidoLlevar).mockRejectedValueOnce(new Error('Plato agotado 103'));
    await act(async () => {
      await result.current.ejecutarRegistroPedidoLlevar();
    });
    expect(result.current.errorEnvio).toContain('103');

    act(() => result.current.descartarPedido());
    expect(result.current.lineas).toEqual([]);
    expect(result.current.referencia).toBe('');
  });
});
