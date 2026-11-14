import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterChipBar, type FilterChipItem } from './FilterChipBar';

describe('FilterChipBar - Barra de filtros con accesibilidad aria-pressed', () => {
  const chips: FilterChipItem[] = [
    { id: 'todos', label: 'Todos', count: 12 },
    { id: 'libres', label: 'Libres', count: 8 },
    { id: 'ocupadas', label: 'Ocupadas', count: 4 },
  ];

  it('debe renderizar todos los chips con sus etiquetas y conteos', () => {
    render(
      <FilterChipBar
        items={chips}
        selectedId="todos"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Libres')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Ocupadas')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('debe marcar aria-pressed="true" en el chip seleccionado y "false" en los demás', () => {
    render(
      <FilterChipBar
        items={chips}
        selectedId="libres"
        onSelect={vi.fn()}
      />
    );

    const btnTodos = screen.getByRole('button', { name: /todos/i });
    const btnLibres = screen.getByRole('button', { name: /libres/i });
    const btnOcupadas = screen.getByRole('button', { name: /ocupadas/i });

    expect(btnLibres).toHaveAttribute('aria-pressed', 'true');
    expect(btnTodos).toHaveAttribute('aria-pressed', 'false');
    expect(btnOcupadas).toHaveAttribute('aria-pressed', 'false');
  });

  it('debe invocar onSelect con el id correspondiente al hacer clic', () => {
    const onSelect = vi.fn();

    render(
      <FilterChipBar
        items={chips}
        selectedId="todos"
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /ocupadas/i }));
    expect(onSelect).toHaveBeenCalledWith('ocupadas');
  });
});
