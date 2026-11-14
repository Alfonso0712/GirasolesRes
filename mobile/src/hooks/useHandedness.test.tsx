import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { setHandedness } from './useHandedness';
import { SheetActions } from '../components/ui/SheetActions';

describe('Orientación diestro o zurdo (R-F)', () => {
  beforeEach(() => {
    localStorage.clear();
    setHandedness('right');
  });

  it('aplica la clase "diestro" o "zurdo" en <html> al iniciar y al cambiar', () => {
    expect(document.documentElement.classList.contains('diestro')).toBe(true);
    expect(document.documentElement.classList.contains('zurdo')).toBe(false);

    setHandedness('left');
    expect(document.documentElement.classList.contains('zurdo')).toBe(true);
    expect(document.documentElement.classList.contains('diestro')).toBe(false);
    expect(localStorage.getItem('girasoles_handedness')).toBe('left');
  });

  it('coloca el botón principal de SheetActions a la derecha en diestro y a la izquierda en zurdo', () => {
    setHandedness('right');
    render(
      <SheetActions
        secondaryLabel="Cancelar"
        primaryLabel="Guardar"
        onSecondary={() => {}}
        onPrimary={() => {}}
      />
    );

    const botonesDiestro = screen.getAllByRole('button');
    expect(botonesDiestro[0]).toHaveTextContent('Cancelar');
    expect(botonesDiestro[1]).toHaveTextContent('Guardar');

    act(() => {
      setHandedness('left');
    });

    const botonesZurdo = screen.getAllByRole('button');
    expect(botonesZurdo[0]).toHaveTextContent('Guardar');
    expect(botonesZurdo[1]).toHaveTextContent('Cancelar');
  });
});
