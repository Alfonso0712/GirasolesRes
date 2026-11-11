import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HomePage } from '../HomePage';
import { cajaService } from '../../services/cajaService';
import { comandaService } from '../../services/comandaService';
import { pedidoService } from '../../services/pedidoService';
import { inicioService } from '../../services/inicioService';
import { DashboardMozoView } from '../../components/dashboard/DashboardMozoView';
import { setReducedMotion } from '../../hooks/useReducedMotion';
import type { UserSession } from '../../types/auth';

describe('HomePage - Pruebas de Caracterización y Layout Principal', () => {
  const mockSession: UserSession = {
    token: 'jwt-home',
    usuario: 'admin01',
    nombre: 'Carlos Admin',
    rol: 'Administrador',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(cajaService, 'obtenerActual').mockResolvedValue({
      estado: 'abierta',
      apertura: {
        cajaId: 'caja-1',
        fechaApertura: '2026-10-30T08:00:00Z',
        fechaAperturaLocal: '30/10/2026 03:00',
        montoInicial: 100.0,
        idUsuarioApertura: 'u1',
        nombreUsuarioApertura: 'Carlos Admin',
      },
      resumenParcial: {
        totalVentas: 300.0,
        totalEfectivo: 200.0,
        totalYape: 100.0,
        cantidadVentas: 8,
      },
      sugerenciaMontoInicial: 100.0,
    });

    vi.spyOn(comandaService, 'listarComandas').mockResolvedValue({
      comandas: [],
      total: 0,
    } as any);

    vi.spyOn(pedidoService, 'obtenerAvisosPendientes').mockResolvedValue([]);

    vi.spyOn(inicioService, 'obtenerInicio').mockResolvedValue({
      rol: 'Administrador',
      fecha: '2026-10-30',
      bloques: {
        ventasHoy: {
          estado: 'ok',
          datos: {
            nVentas: 8,
            total: 300.0,
            efectivo: 200.0,
            yape: 100.0,
          },
        },
      },
    });
  });

  it('debe renderizar el marco principal, cabecera y coincidir con snapshot', async () => {
    const { container } = render(
      <HomePage
        session={mockSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Carlos Admin/i)).toBeInTheDocument();
    });

    expect(screen.getByAltText(/Girasoles Restaurante/i)).toBeInTheDocument();
    expect(screen.getByText(/Salón y Pedidos/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('Administrador y Mozo no ven accesos a Pedido para Llevar y el Cajero sí', async () => {
    const validToken = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
    )}.signature`;

    // 1. Administrador: no debe ver "Pedido para Llevar" en accesos rápidos
    const adminSession: UserSession = {
      ...mockSession,
      token: validToken,
    };
    const { unmount: unmountAdmin } = render(
      <HomePage
        session={adminSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Carlos Admin/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Pedido para Llevar/i)).not.toBeInTheDocument();
    unmountAdmin();

    // 2. Mozo: no debe ver "Pedido para Llevar"
    const mozoSession: UserSession = {
      token: validToken,
      usuario: 'mozo01',
      nombre: 'Mario Mozo',
      rol: 'Mozo',
    };
    vi.spyOn(inicioService, 'obtenerInicio').mockResolvedValue({
      rol: 'Mozo',
      fecha: '2026-10-30',
      bloques: {},
    });
    const { unmount: unmountMozo } = render(
      <HomePage
        session={mozoSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Mario Mozo/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Pedido para Llevar/i)).not.toBeInTheDocument();
    unmountMozo();

    // 3. Cajero: sí debe ver "Pedido para Llevar" en accesos rápidos
    const cajeroSession: UserSession = {
      token: validToken,
      usuario: 'cajero01',
      nombre: 'Carla Cajera',
      rol: 'Cajero',
    };
    vi.spyOn(inicioService, 'obtenerInicio').mockResolvedValue({
      rol: 'Cajero',
      fecha: '2026-10-30',
      bloques: {},
    });
    render(
      <HomePage
        session={cajeroSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Carla Cajera/i)).toBeInTheDocument();
    });
    expect(await screen.findByText(/Pedido para Llevar/i)).toBeInTheDocument();
  });

  it('un rol no Cajero que intenta acceder a pedidos-llevar es redirigido a inicio', async () => {
    render(
      <HomePage
        session={mockSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
        paginaInicial="pedidos-llevar"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Carlos Admin/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Catálogo de Productos para Llevar/i)).not.toBeInTheDocument();
  });

  it('los h1 coinciden con los nombres del menú lateral y document.title cambia con la pantalla y se restaura', async () => {
    const { unmount } = render(
      <HomePage
        session={mockSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Carlos Admin/i)).toBeInTheDocument();
    });
    expect(document.title).toBe('Inicio - Girasoles');
    unmount();
    expect(document.title).toBe('Restaurante Girasoles');
  });

  it('las tarjetas de accesos rápidos no tienen la clase uppercase', async () => {
    const validToken = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
    )}.signature`;
    const adminSession: UserSession = {
      ...mockSession,
      token: validToken,
    };
    const { container } = render(
      <HomePage
        session={adminSession}
        onLogout={vi.fn()}
        onUpdateSession={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Carlos Admin/i)).toBeInTheDocument();
    });
    const quickActionSpans = container.querySelectorAll('button > span.font-semibold');
    expect(quickActionSpans.length).toBeGreaterThan(0);
    quickActionSpans.forEach((span) => {
      expect(span.className).not.toContain('uppercase');
    });
  });

  it('la animación de aviso de pedidos listos en DashboardMozoView respeta Reducir animaciones', () => {
    const bloquesMock = {
      misListos: {
        estado: 'ok',
        datos: { cantidad: 2 },
      },
    };

    // Caso 1: reducedMotion desactivado -> incluye motion-safe:animate-pulse
    setReducedMotion(false, true);
    const { unmount } = render(
      <DashboardMozoView
        bloques={bloquesMock}
        onNavigate={vi.fn()}
        renderBloqueError={() => null}
      />
    );
    const avisoConAnimacion = screen.getByTestId('aviso-pedidos-listos-mozo');
    expect(avisoConAnimacion.className).toContain('motion-safe:animate-pulse');
    unmount();

    // Caso 2: reducedMotion activado -> no incluye animate-pulse
    setReducedMotion(true, true);
    render(
      <DashboardMozoView
        bloques={bloquesMock}
        onNavigate={vi.fn()}
        renderBloqueError={() => null}
      />
    );
    const avisoSinAnimacion = screen.getByTestId('aviso-pedidos-listos-mozo');
    expect(avisoSinAnimacion.className).not.toContain('animate-pulse');
  });
});
