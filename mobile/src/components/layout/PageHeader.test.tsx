// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlidersHorizontal, UtensilsCrossed } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { IconButton } from '../ui/IconButton';

describe('PageHeader', () => {
  it('renderiza etiquetas en una segunda fila después del título y subtítulo', () => {
    render(
      <PageHeader
        title="Menú del día"
        subtitle="Definir disponibilidad para sábado 14 de noviembre"
        etiquetas={<StatusBadge estado="Menú definido" />}
      />
    );

    const heading = screen.getByRole('heading', { name: 'Menú del día' });
    const subtitle = screen.getByText('Definir disponibilidad para sábado 14 de noviembre');
    const rowEtiquetas = screen.getByTestId('page-header-etiquetas');
    const badge = screen.getByText('Menú definido');

    expect(rowEtiquetas.contains(badge)).toBe(true);
    expect(heading.compareDocumentPosition(rowEtiquetas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(subtitle.compareDocumentPosition(rowEtiquetas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('expone nombres accesibles en botones de volver, actualizar y acciones de ícono', () => {
    const onVolver = vi.fn();
    const onRefresh = vi.fn();
    const onAction = vi.fn();

    render(
      <PageHeader
        title="Salón"
        onVolver={onVolver}
        onRefresh={onRefresh}
        actions={
          <IconButton aria-label="Gestionar mesas" onClick={onAction}>
            <SlidersHorizontal className="w-5 h-5" />
          </IconButton>
        }
      />
    );

    const btnVolver = screen.getByRole('button', { name: 'Volver' });
    const btnRefresh = screen.getByRole('button', { name: 'Actualizar Salón' });
    const btnAction = screen.getByRole('button', { name: 'Gestionar mesas' });

    fireEvent.click(btnVolver);
    fireEvent.click(btnRefresh);
    fireEvent.click(btnAction);

    expect(onVolver).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('mantiene el título sin utilidades que partan palabras letra por letra', () => {
    render(<PageHeader title="Menú del día" />);

    const heading = screen.getByRole('heading', { name: 'Menú del día' });
    const forbiddenClass = ['break', 'all'].join('-');
    const forbiddenProp = ['overflow', 'wrap'].join('-') + ':anywhere';

    expect(heading.className).toContain('line-clamp-2');
    expect(heading.className).not.toContain(forbiddenClass);
    expect(heading.className).not.toContain(forbiddenProp);
  });

  it('omite el ícono decorativo en la fila 1 cuando existe onVolver para preservar ancho del título', () => {
    render(
      <PageHeader
        title="Menú del día"
        icon={<UtensilsCrossed data-testid="header-icon" className="w-5 h-5" />}
        onVolver={vi.fn()}
      />
    );

    expect(screen.queryByTestId('header-icon')).toBeNull();
  });
});
