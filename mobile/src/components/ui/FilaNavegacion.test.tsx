// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarCheck } from 'lucide-react';
import { FilaNavegacion } from './FilaNavegacion';
import { StatusBadge } from './StatusBadge';

describe('FilaNavegacion', () => {
  it('renderiza título, descripción y etiqueta debajo del texto en orden del DOM', () => {
    const onClick = vi.fn();
    render(
      <FilaNavegacion
        icono={<CalendarCheck className="w-5 h-5" />}
        titulo="Menú del día"
        descripcion="Definir menús completos, opciones y platos de carta de hoy"
        etiqueta={<StatusBadge estado="Menú no definido hoy" />}
        onClick={onClick}
      />
    );

    const titulo = screen.getByText('Menú del día');
    const descripcion = screen.getByText(
      'Definir menús completos, opciones y platos de carta de hoy'
    );
    const etiqueta = screen.getByText('Menú no definido hoy');

    expect(titulo).toBeTruthy();
    expect(descripcion).toBeTruthy();
    expect(etiqueta).toBeTruthy();

    // Verifica que la etiqueta aparezca después del título y de la descripción en el DOM
    expect(titulo.compareDocumentPosition(etiqueta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      descripcion.compareDocumentPosition(etiqueta) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('tiene rol button, nombre accesible y dispara onClick al pulsar', () => {
    const onClick = vi.fn();
    render(
      <FilaNavegacion
        icono={<CalendarCheck className="w-5 h-5" />}
        titulo="Menú del día"
        descripcion="Opciones de hoy"
        ariaLabel="Abrir Menú del día"
        onClick={onClick}
      />
    );

    const boton = screen.getByRole('button', { name: 'Abrir Menú del día' });
    fireEvent.click(boton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('usa el contenido visible como nombre accesible cuando no se especifica ariaLabel', () => {
    const onClick = vi.fn();
    render(
      <FilaNavegacion
        icono={<CalendarCheck className="w-5 h-5" />}
        titulo="Perfil y ajustes"
        onClick={onClick}
      />
    );

    const boton = screen.getByRole('button', { name: /Perfil y ajustes/i });
    fireEvent.click(boton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
