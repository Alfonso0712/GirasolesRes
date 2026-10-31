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
});
