import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeccionPosicionMenu } from '../SeccionPosicionMenu';

describe('SeccionPosicionMenu Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar las opciones de Modo Diestro y Modo Zurdo', () => {
    render(<SeccionPosicionMenu />);

    expect(screen.getByRole('radio', { name: /modo diestro/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /modo zurdo/i })).toBeInTheDocument();
  });

  it('debe permitir seleccionar Modo Zurdo', () => {
    render(<SeccionPosicionMenu />);

    const btnZurdo = screen.getByRole('radio', { name: /modo zurdo/i });
    fireEvent.click(btnZurdo);
    expect(btnZurdo).toHaveAttribute('aria-checked', 'true');
  });
});
