import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeccionApariencia } from '../SeccionApariencia';

describe('SeccionApariencia Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar el selector de tema con Claro, Oscuro y Automático', () => {
    render(<SeccionApariencia />);

    expect(screen.getByRole('radiogroup', { name: /tema del sistema/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^claro$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^oscuro$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^automático$/i })).toBeInTheDocument();
  });

  it('debe incluir el selector de tamaño del texto y el interruptor de reducir animaciones', () => {
    render(<SeccionApariencia />);

    expect(screen.getByRole('radiogroup', { name: /tamaño del texto/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /reducir animaciones/i })).toBeInTheDocument();
  });

  it('debe cambiar de tema al pulsar una opción', () => {
    render(<SeccionApariencia />);

    const radioOscuro = screen.getByRole('radio', { name: /^oscuro$/i });
    fireEvent.click(radioOscuro);
    expect(radioOscuro).toHaveAttribute('aria-checked', 'true');
  });

  it('debe activar y desactivar reducir animaciones con el switch', () => {
    render(<SeccionApariencia />);

    const switchMotion = screen.getByRole('switch', { name: /reducir animaciones/i });
    expect(switchMotion).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchMotion);
    expect(switchMotion).toHaveAttribute('aria-checked', 'true');
  });
});
