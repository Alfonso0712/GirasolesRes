// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { ToastProvider } from '../context/ToastContext';
import { MesasView } from '../components/mesas/MesasView';
import { useMesasConPedidos } from './useMesasConPedidos';
import { mesaService } from '../services/mesaService';
import { pedidoService } from '../services/pedidoService';
import { authService } from '../services/authService';
import { ApiError } from '../services/apiClient';
import type { MesaItem } from '../types/mesa';
import type { PedidoItemDto } from '../types/pedido';

vi.mock('../services/mesaService', () => ({
  mesaService: { getMesas: vi.fn() },
}));

vi.mock('../services/pedidoService', () => ({
  pedidoService: { listarPedidos: vi.fn() },
}));

vi.mock('../services/cobroService', () => ({
  cobroService: { obtenerPedidosPendientes: vi.fn() },
}));

vi.mock('../services/authService', () => ({
  authService: { getStoredSession: vi.fn() },
}));

const { hapticsMock } = vi.hoisted(() => ({
  hapticsMock: {
    triggerLight: vi.fn(),
    triggerMedium: vi.fn(),
    triggerSuccess: vi.fn(),
    triggerError: vi.fn(),
  },
}));

vi.mock('./useHaptics', () => ({
  useHaptics: () => hapticsMock,
}));

vi.mock('./useNetworkStatus', () => ({
  useNetworkStatus: () => ({ sinConexion: false }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

const MESAS_BASE: MesaItem[] = [
  { id: 'mesa-10', nombre: 'Mesa 10', ocupacion: 'Ocupada', activa: true },
  { id: 'mesa-20', nombre: 'Mesa 20', ocupacion: 'Ocupada', activa: true },
];

const PEDIDOS_VALIDOS: PedidoItemDto[] = [
  {
    id: 'ped-101',
    numero: 101,
    tipo: 'Mesa',
    mesa: 'Mesa 10',
    hora: '12:00',
    total: 45,
    estado: 'EnPreparacion',
    registradoPor: 'Mozo Ana',
    usuarioId: 'usr-1',
  },
];

async function vaciarMicrotareas() {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
  }
}

describe('useMesasConPedidos - Política de errores y transición de polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(authService.getStoredSession).mockReturnValue({
      id: 'usr-admin',
      nombre: 'Admin',
      apellido: 'Sistema',
      correo: 'admin@girasoles.pe',
      rol: 'Administrador',
      token: 'tok-test',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('avisa una sola vez ante múltiples intervalos fallidos, conserva totales previos, muestra null/— sin datos nuevos y rearma tras un éxito', async () => {
    vi.mocked(mesaService.getMesas)
      .mockResolvedValueOnce([{ id: 'mesa-10', nombre: 'Mesa 10', ocupacion: 'Ocupada', activa: true }])
      .mockResolvedValue(MESAS_BASE);

    vi.mocked(pedidoService.listarPedidos)
      .mockResolvedValueOnce(PEDIDOS_VALIDOS)
      .mockRejectedValueOnce(new ApiError({ status: 503, mensaje: 'Fallo temporal' }))
      .mockRejectedValueOnce(new ApiError({ status: 503, mensaje: 'Sigue caído' }))
      .mockResolvedValueOnce(PEDIDOS_VALIDOS)
      .mockRejectedValueOnce(new ApiError({ status: 503, mensaje: 'Caída posterior' }));

    const capturado: { valor: ReturnType<typeof useMesasConPedidos> | null } = { valor: null };
    function Monitor() {
      capturado.valor = useMesasConPedidos({ rol: 'Administrador', enabled: true });
      return null;
    }

    render(<Monitor />, { wrapper: Wrapper });

    await act(async () => {
      await vaciarMicrotareas();
    });
    expect(capturado.valor?.mesas[0].totalPendiente).toBe(45);

    // Primer intervalo fallido: emite 1 toast, conserva mesa-10 (45) y deja mesa-20 sin datos en null (no 0)
    await act(async () => {
      vi.advanceTimersByTime(15_000);
      await vaciarMicrotareas();
    });
    expect(capturado.valor?.mesas.find((m) => m.id === 'mesa-10')?.totalPendiente).toBe(45);
    expect(capturado.valor?.mesas.find((m) => m.id === 'mesa-20')?.totalPendiente).toBeNull();
    expect(
      screen.getByText('No se pudieron cargar los pedidos de las mesas. Los totales no están disponibles.')
    ).toBeTruthy();

    // Auto-ocultar del toast (6000 ms) y segundo intervalo fallido consecutivo (t = 30s): NO vuelve a emitir aviso
    await act(async () => {
      vi.advanceTimersByTime(15_000);
      await vaciarMicrotareas();
    });
    expect(
      screen.queryByText('No se pudieron cargar los pedidos de las mesas. Los totales no están disponibles.')
    ).toBeNull();

    // Tercer intervalo (t = 45s): éxito -> rearma transición
    await act(async () => {
      vi.advanceTimersByTime(15_000);
      await vaciarMicrotareas();
    });

    // Cuarto intervalo (t = 60s): nuevo fallo tras éxito -> vuelve a avisar una vez
    await act(async () => {
      vi.advanceTimersByTime(15_000);
      await vaciarMicrotareas();
    });
    expect(
      screen.getByText('No se pudieron cargar los pedidos de las mesas. Los totales no están disponibles.')
    ).toBeTruthy();
  });

  it('no emite toast cuando el fallo de pedidos es 401', async () => {
    vi.mocked(mesaService.getMesas).mockResolvedValueOnce([MESAS_BASE[0]]);
    vi.mocked(pedidoService.listarPedidos).mockRejectedValueOnce(
      new ApiError({ status: 401, mensaje: 'No autorizado' })
    );

    const { result } = renderHook(
      () => useMesasConPedidos({ rol: 'Mozo', enabled: true }),
      { wrapper: Wrapper }
    );

    await act(async () => {
      await vaciarMicrotareas();
    });

    expect(result.current.mesas[0].totalPendiente).toBeNull();
    expect(
      screen.queryByText('No se pudieron cargar los pedidos de las mesas. Los totales no están disponibles.')
    ).toBeNull();
  });

  it('MesasView muestra aviso con Reintentar si activar mesa falla sin rechazo sin capturar', async () => {
    vi.useRealTimers();
    const onCambiarEstadoMesa = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiError({ status: 422, mensaje: 'No se pudo activar en este momento.' })
      );

    render(
      <ToastProvider>
        <MesasView
          mesas={[{ id: 'mesa-30', nombre: 'Mesa 30', ocupacion: 'Libre', activa: false }]}
          cargando={false}
          error={null}
          onRefresh={vi.fn()}
          onAbrirPedidoMesa={vi.fn()}
          rol="Administrador"
          modoGestion={true}
          mostrarInactivas={true}
          onCambiarEstadoMesa={onCambiarEstadoMesa}
        />
      </ToastProvider>
    );

    const btnActivar = screen.getByRole('button', { name: 'Activar Mesa 30' });
    await act(async () => {
      btnActivar.click();
    });

    expect(screen.getByText('No se pudo activar en este momento.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });
});
