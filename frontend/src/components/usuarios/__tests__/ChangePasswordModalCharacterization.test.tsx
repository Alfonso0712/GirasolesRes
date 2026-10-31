import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangePasswordModal } from '../ChangePasswordModal';

describe('ChangePasswordModal - Pruebas de Caracterización y Cambio de Clave', () => {
  it('debe renderizar el modal con los tres campos y coincidir con snapshot', () => {
    const { container } = render(
      <ChangePasswordModal
        isOpen={true}
        onClose={vi.fn()}
        token="test-jwt-token"
        onSuccess={vi.fn()}
        onForceLogoutDueToFailedAttempts={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeInTheDocument();
    expect(screen.getByText('Contraseña actual')).toBeInTheDocument();
    expect(screen.getByText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByText('Confirmar nueva contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('debe alternar la visibilidad de la contraseña al pulsar Mostrar/Ocultar', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={vi.fn()}
        token="test-jwt-token"
        onSuccess={vi.fn()}
        onForceLogoutDueToFailedAttempts={vi.fn()}
      />
    );

    const toggleBtns = screen.getAllByRole('button', { name: 'Mostrar' });
    expect(toggleBtns.length).toBe(3);

    fireEvent.click(toggleBtns[0]);
    expect(screen.getByRole('button', { name: 'Ocultar' })).toBeInTheDocument();
  });
});
