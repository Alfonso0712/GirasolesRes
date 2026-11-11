import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeccionPerfil } from '../SeccionPerfil';
import type { UserSession } from '../../../types/auth';

describe('SeccionPerfil Component', () => {
  const adminSession: UserSession = {
    token: 'jwt-admin',
    nombre: 'Carlos Mendoza',
    usuario: 'cmendoza',
    rol: 'Administrador',
  };

  const mozoSession: UserSession = {
    token: 'jwt-mozo',
    nombre: 'Ana Rojas',
    usuario: 'arojas',
    rol: 'Mozo',
  };

  it('debe mostrar los datos del usuario en solo lectura', () => {
    render(<SeccionPerfil session={adminSession} />);

    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
    expect(screen.getByText('@cmendoza')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.queryByText('jwt-admin')).not.toBeInTheDocument();
  });

  it('debe mostrar el botón de Cambiar contraseña solo para rol Administrador', () => {
    const handleCambiar = vi.fn();
    const { rerender } = render(
      <SeccionPerfil session={adminSession} onCambiarPassword={handleCambiar} />
    );

    const btn = screen.getByRole('button', { name: /cambiar contraseña/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleCambiar).toHaveBeenCalledTimes(1);

    rerender(<SeccionPerfil session={mozoSession} onCambiarPassword={handleCambiar} />);
    expect(screen.queryByRole('button', { name: /cambiar contraseña/i })).not.toBeInTheDocument();
  });

  it('debe renderizar el avatar de iniciales con forma circular rounded-full', () => {
    render(<SeccionPerfil session={adminSession} />);
    const avatar = screen.getByText('CM');
    expect(avatar).toHaveClass('rounded-full');
  });
});
