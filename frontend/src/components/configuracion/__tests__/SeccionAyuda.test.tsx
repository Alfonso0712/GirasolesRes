import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeccionAyuda } from '../SeccionAyuda';

describe('SeccionAyuda Component', () => {
  it('debe renderizar las tareas específicas del rol Mozo', () => {
    render(<SeccionAyuda rol="Mozo" />);

    expect(screen.getByText('Tomar un pedido en mesa')).toBeInTheDocument();
    expect(screen.getByText('Ampliar un pedido existente')).toBeInTheDocument();
    expect(screen.getByText('Consultar y anular pedidos')).toBeInTheDocument();
    expect(screen.queryByText('Abrir caja al inicio del turno')).not.toBeInTheDocument();
  });

  it('debe renderizar las tareas específicas del rol Cajero', () => {
    render(<SeccionAyuda rol="Cajero" />);

    expect(screen.getByText('Abrir caja al inicio del turno')).toBeInTheDocument();
    expect(screen.getByText('Cobrar un pedido y emitir comprobante')).toBeInTheDocument();
    expect(screen.getByText('Realizar arqueo y cierre de caja')).toBeInTheDocument();
  });

  it('debe renderizar las tareas específicas del rol Cocinero', () => {
    render(<SeccionAyuda rol="Cocinero" />);

    expect(screen.getByText('Atender y preparar comandas en KDS')).toBeInTheDocument();
    expect(screen.getByText('Marcar comanda como lista')).toBeInTheDocument();
    expect(screen.getByText('Marcar platos o componentes agotados')).toBeInTheDocument();
  });

  it('debe renderizar las tareas específicas del rol Administrador', () => {
    render(<SeccionAyuda rol="Administrador" />);

    expect(screen.getByText('Configurar menú del día y armar menús completos')).toBeInTheDocument();
    expect(screen.getByText('Registrar productos de carta y componentes')).toBeInTheDocument();
    expect(screen.getByText('Gestionar usuarios y accesos del personal')).toBeInTheDocument();
    expect(screen.getByText('Consultar reportes y balance de ventas')).toBeInTheDocument();
  });

  it('debe expandir y colapsar los pasos al hacer clic en el encabezado de la tarea', () => {
    render(<SeccionAyuda rol="Mozo" />);

    const boton = screen.getByRole('button', { name: /tomar un pedido en mesa/i });
    expect(boton).toHaveAttribute('aria-expanded', 'true');

    // Colapsar
    fireEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'false');

    // Expandir nuevamente
    fireEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/haga clic en una mesa en estado "libre"/i)).toBeInTheDocument();
  });
});
