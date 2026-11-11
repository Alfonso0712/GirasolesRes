import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import type { UserSession } from '../../../types/auth';

describe('Sidebar - Pruebas de Caracterización y Navegación', () => {
  const adminSession: UserSession = {
    nombre: 'Administrador General',
    usuario: 'admin',
    rol: 'Administrador',
    token: 'fake-token',
  };

  const mozoSession: UserSession = {
    nombre: 'Mozo Uno',
    usuario: 'mozo1',
    rol: 'Mozo',
    token: 'fake-token-mozo',
  };

  it('debe renderizar la barra lateral para Administrador y coincidir con snapshot', () => {
    const { container } = render(
      <Sidebar
        session={adminSession}
        paginaActiva="inicio"
        onSelectPagina={vi.fn()}
        isOpenMobile={false}
        cajaEstado="abierta"
        pedidosListosCount={2}
      />
    );

    expect(screen.getByAltText('Girasoles Restaurante')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Acceso protegido')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('debe renderizar grupos expandidos para Mozo y mostrar badges', () => {
    const { container } = render(
      <Sidebar
        session={mozoSession}
        paginaActiva="mesas"
        onSelectPagina={vi.fn()}
        isOpenMobile={true}
        onCloseMobile={vi.fn()}
        cajaEstado="abierta"
        pedidosListosCount={5}
      />
    );

    expect(screen.getByText('Salón y Pedidos')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renderiza el indicador de caja en menú colapsado con texto accesible e ícono para cada estado', () => {
    // 1. Caja abierta
    const { rerender } = render(
      <Sidebar
        session={adminSession}
        paginaActiva="inicio"
        onSelectPagina={vi.fn()}
        isOpenMobile={false}
        cajaEstado="abierta"
      />
    );

    const indicadorAbierta = screen.getByLabelText('Caja: abierta');
    expect(indicadorAbierta).toBeInTheDocument();
    expect(indicadorAbierta).toHaveAttribute('title', 'Caja: abierta');
    expect(indicadorAbierta.querySelector('.lucide-unlock')).toBeInTheDocument();

    // 2. Caja anterior sin cerrar
    rerender(
      <Sidebar
        session={adminSession}
        paginaActiva="inicio"
        onSelectPagina={vi.fn()}
        isOpenMobile={false}
        cajaEstado="anteriorSinCerrar"
      />
    );

    const indicadorPendiente = screen.getByLabelText('Caja: cierre pendiente');
    expect(indicadorPendiente).toBeInTheDocument();
    expect(indicadorPendiente).toHaveAttribute('title', 'Caja: cierre pendiente');
    expect(indicadorPendiente.querySelector('.lucide-alert-triangle')).toBeInTheDocument();

    // 3. Caja cerrada
    rerender(
      <Sidebar
        session={adminSession}
        paginaActiva="inicio"
        onSelectPagina={vi.fn()}
        isOpenMobile={false}
        cajaEstado="cerrada"
      />
    );

    const indicadorCerrada = screen.getByLabelText('Caja: cerrada');
    expect(indicadorCerrada).toBeInTheDocument();
    expect(indicadorCerrada).toHaveAttribute('title', 'Caja: cerrada');
    expect(indicadorCerrada.querySelector('.lucide-lock')).toBeInTheDocument();
  });
});
