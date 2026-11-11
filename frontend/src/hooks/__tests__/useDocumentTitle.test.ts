import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle, DEFAULT_DOCUMENT_TITLE } from '../useDocumentTitle';

describe('useDocumentTitle - Título dinámico de la pestaña del navegador', () => {
  beforeEach(() => {
    document.title = DEFAULT_DOCUMENT_TITLE;
  });

  afterEach(() => {
    document.title = DEFAULT_DOCUMENT_TITLE;
  });

  it('establece "Inicio - Girasoles" cuando la página activa es "inicio"', () => {
    renderHook(() => useDocumentTitle('inicio'));
    expect(document.title).toBe('Inicio - Girasoles');
  });

  it('establece "{Nombre de la pantalla} - Girasoles" usando el nombre exacto del menú lateral', () => {
    const { rerender } = renderHook(({ page }) => useDocumentTitle(page), {
      initialProps: { page: 'mesas' },
    });
    expect(document.title).toBe('Mesas y Salón - Girasoles');

    rerender({ page: 'pedidos' });
    expect(document.title).toBe('Gestión de Pedidos - Girasoles');

    rerender({ page: 'caja' });
    expect(document.title).toBe('Caja y Cobros - Girasoles');

    rerender({ page: 'productos' });
    expect(document.title).toBe('Productos - Girasoles');

    rerender({ page: 'menu-dia' });
    expect(document.title).toBe('Menú del día - Girasoles');

    rerender({ page: 'ventas' });
    expect(document.title).toBe('Historial de Ventas - Girasoles');

    rerender({ page: 'historial-cierres' });
    expect(document.title).toBe('Historial de Cierres - Girasoles');

    rerender({ page: 'usuarios' });
    expect(document.title).toBe('Usuarios - Girasoles');

    rerender({ page: 'reportes' });
    expect(document.title).toBe('Reportes - Girasoles');

    rerender({ page: 'cocina' });
    expect(document.title).toBe('Cocina (KDS) - Girasoles');
  });

  it('restaura el título por defecto "Restaurante Girasoles" al desmontarse', () => {
    const { unmount } = renderHook(() => useDocumentTitle('mesas'));
    expect(document.title).toBe('Mesas y Salón - Girasoles');

    unmount();
    expect(document.title).toBe(DEFAULT_DOCUMENT_TITLE);
  });
});
