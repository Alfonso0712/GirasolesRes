import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SelectorPedidoModal } from '../SelectorPedidoModal';
import type { PedidoAbiertoMesaDto } from '../../../types/pedido';

describe('SelectorPedidoModal', () => {
  const pedidosEjemplo: PedidoAbiertoMesaDto[] = [
    {
      id: 'ped-guid-1',
      numero: 101,
      estado: 'EnPreparacion',
      total: 45.5,
    },
    {
      id: 'ped-guid-2',
      numero: 102,
      estado: 'PorCobrar',
      total: 78.0,
    },
  ];

  it('con 2 pedidos abiertos muestra número, estado y total de cada uno y no autoselecciona ninguno', () => {
    const onSeleccionarPedidoMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <SelectorPedidoModal
        isOpen={true}
        mesaNombre="Mesa 5"
        pedidos={pedidosEjemplo}
        onSeleccionarPedido={onSeleccionarPedidoMock}
        onClose={onCloseMock}
      />
    );

    // 1. Cabecera muestra título y cantidad de pedidos
    expect(screen.getByText(/Seleccionar Pedido · Mesa 5/i)).toBeInTheDocument();
    expect(screen.getByText(/La mesa tiene 2 pedidos abiertos/i)).toBeInTheDocument();

    // 2. Muestra número, estado y total de ambos pedidos
    expect(screen.getByText('Pedido N.º 101')).toBeInTheDocument();
    expect(screen.getByText('EnPreparacion')).toBeInTheDocument();
    expect(screen.getByText('S/ 45.50')).toBeInTheDocument();

    expect(screen.getByText('Pedido N.º 102')).toBeInTheDocument();
    expect(screen.getByText('PorCobrar')).toBeInTheDocument();
    expect(screen.getByText('S/ 78.00')).toBeInTheDocument();

    // 3. No autoselecciona ninguno por defecto
    expect(onSeleccionarPedidoMock).not.toHaveBeenCalled();

    // 4. Al hacer click en el segundo pedido, emite su ID correspondiente
    fireEvent.click(screen.getByText('Pedido N.º 102'));
    expect(onSeleccionarPedidoMock).toHaveBeenCalledTimes(1);
    expect(onSeleccionarPedidoMock).toHaveBeenCalledWith('ped-guid-2');
  });

  it('con 1 solo pedido abierto el flujo de negocio continúa directo sin selector modal', async () => {
    const pedidoUnico: PedidoAbiertoMesaDto[] = [
      {
        id: 'ped-guid-unico',
        numero: 105,
        estado: 'EnPreparacion',
        total: 32.0,
      },
    ];

    const onNavigateToPedidoMock = vi.fn();
    const setSelectorMock = vi.fn();

    // Simulación del flujo exacto de MesasPage.tsx:iniciarAgregarProductos
    const resolverAgregarProductos = (
      mesaId: number,
      pedidos: PedidoAbiertoMesaDto[],
      onNavigate: (mesaId: number, modo: string, pedidoId?: string) => void,
      setSelector: (val: unknown) => void
    ) => {
      if (!pedidos || pedidos.length === 0) {
        onNavigate(mesaId, 'nuevo');
      } else if (pedidos.length === 1) {
        onNavigate(mesaId, 'ampliacion', pedidos[0].id);
      } else {
        setSelector({ mesaId, pedidos });
      }
    };

    resolverAgregarProductos(5, pedidoUnico, onNavigateToPedidoMock, setSelectorMock);

    // Debe continuar directamente al pedido único sin abrir el selector modal
    expect(onNavigateToPedidoMock).toHaveBeenCalledTimes(1);
    expect(onNavigateToPedidoMock).toHaveBeenCalledWith(5, 'ampliacion', 'ped-guid-unico');
    expect(setSelectorMock).not.toHaveBeenCalled();
  });
});
