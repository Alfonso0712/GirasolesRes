import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumenPedidoPanel } from '../ResumenPedidoPanel';
import type { LineaBorrador } from '../../../types/pedido';

describe('ResumenPedidoPanel - Pruebas de Caracterización y Cálculos de Carrito', () => {
  it('debe renderizar el estado vacío con snapshot fiel', () => {
    const { container } = render(
      <ResumenPedidoPanel
        titulo="Pedido de mesa"
        etiquetaContexto="Mesa 5"
        lineasBorrador={[]}
        erroresLineas={{}}
        cantidadTotalProductos={0}
        totalCalculado={0}
        registrando={false}
        deshabilitarConfirmar={true}
        onAbrirNota={vi.fn()}
        onRepetirLinea={vi.fn()}
        onDisminuirLinea={vi.fn()}
        onQuitarLinea={vi.fn()}
        onRegistrarPedido={vi.fn()}
      />
    );

    expect(screen.getAllByText(/Pedido de mesa/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mesa 5/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Aún no hay productos en el pedido/i).length).toBeGreaterThan(0);

    const btnRegistrar = screen.getAllByRole('button', { name: /REGISTRAR PEDIDO/i })[0];
    expect(btnRegistrar).toBeDisabled();

    expect(container).toMatchSnapshot();
  });

  it('debe calcular exactamente los totales con platos a la carta, menú completo y notas', () => {
    const mockLineas: LineaBorrador[] = [
      {
        id: 'linea-1',
        menuCompletoId: 1,
        nombre: 'Menú Completo Criollo',
        incluye: 'Refresco del día',
        precioUnitario: 18.0,
        cantidad: 1,
        observacion: 'Servir primero la entrada',
        subtotal: 18.0,
        elecciones: [
          { parte: 'Entrada', productoId: 'p1', productoNombre: 'Papa a la Huancaína' },
          { parte: 'Segundo', productoId: 'p2', productoNombre: 'Seco de Pollo con Frejoles' },
        ],
      },
      {
        id: 'linea-2',
        productoId: 'prod-99',
        nombre: 'Ceviche Mixto Especial Criollo',
        precioUnitario: 30.0,
        cantidad: 2,
        observacion: 'Sin picante',
        subtotal: 60.0,
      },
    ];

    const onRegistrarPedido = vi.fn();
    const onRepetirLinea = vi.fn();
    const onDisminuirLinea = vi.fn();

    const { container } = render(
      <ResumenPedidoPanel
        titulo="Pedido de mesa"
        etiquetaContexto="Mesa 5"
        lineasBorrador={mockLineas}
        erroresLineas={{}}
        notas="Mesa VIP junto a la ventana"
        cantidadTotalProductos={3}
        totalCalculado={78.0}
        registrando={false}
        deshabilitarConfirmar={false}
        onAbrirNota={vi.fn()}
        onRepetirLinea={onRepetirLinea}
        onDisminuirLinea={onDisminuirLinea}
        onQuitarLinea={vi.fn()}
        onRegistrarPedido={onRegistrarPedido}
      />
    );

    // Verificación de textos y cálculo numérico
    expect(screen.getAllByText(/Menú Completo Criollo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ceviche Mixto Especial Criollo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Papa a la Huancaína/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Seco de Pollo con Frejoles/i).length).toBeGreaterThan(0);

    // Conteo y Total a cobrar
    expect(screen.getAllByText(/2 items · 3 platos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/78\.00/i).length).toBeGreaterThan(0);

    // Botón habilitado y acción de registrar
    const btnRegistrar = screen.getAllByRole('button', { name: /REGISTRAR PEDIDO/i })[0];
    expect(btnRegistrar).not.toBeDisabled();
    fireEvent.click(btnRegistrar);
    expect(onRegistrarPedido).toHaveBeenCalledTimes(1);

    expect(container).toMatchSnapshot();
  });
});
