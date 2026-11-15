import React from 'react';
import { Plus, Minus } from 'lucide-react';
import type { LineaBorrador, ProductoMenuPedidoDto } from '../../types/pedido';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';

export interface TarjetaProductoCatalogoProps {
  producto: ProductoMenuPedidoDto;
  lineaActual?: LineaBorrador;
  variante: 'mesa' | 'llevar';
  esMozo?: boolean;
  onAgregar: (producto: ProductoMenuPedidoDto) => void;
  onModificarCantidad: (lineaId: string, delta: number) => void;
}

interface BotonAccionProductoProps {
  producto: ProductoMenuPedidoDto;
  lineaActual?: LineaBorrador;
  variante: 'mesa' | 'llevar';
  onAgregar: (producto: ProductoMenuPedidoDto) => void;
  onModificarCantidad: (lineaId: string, delta: number) => void;
}

const StepperProducto: React.FC<{
  nombre: string;
  lineaActual: LineaBorrador;
  onModificarCantidad: (lineaId: string, delta: number) => void;
}> = ({ nombre, lineaActual, onModificarCantidad }) => (
  <div className="handed-stepper flex items-center gap-1.5 bg-canvas border border-line rounded-xl p-1">
    <button
      type="button"
      onClick={() => onModificarCantidad(lineaActual.id, -1)}
      aria-label={`Quitar uno de ${nombre}`}
      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-surface text-danger flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
    >
      <Minus className="w-4 h-4" aria-hidden="true" />
    </button>
    <span className="text-sm font-black text-ink min-w-[24px] text-center tabular-nums">
      {lineaActual.cantidad}
    </span>
    <button
      type="button"
      onClick={() => onModificarCantidad(lineaActual.id, 1)}
      aria-label={`Agregar uno más de ${nombre}`}
      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
    >
      <Plus className="w-4 h-4" aria-hidden="true" />
    </button>
  </div>
);

const BotonAccionProducto: React.FC<BotonAccionProductoProps> = ({
  producto,
  lineaActual,
  variante,
  onAgregar,
  onModificarCantidad,
}) => {
  if (producto.agotado) {
    return (
      <button
        type="button"
        disabled
        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line text-ink-muted flex items-center justify-center cursor-not-allowed opacity-50 shrink-0"
        aria-label={`${producto.nombre} está agotado`}
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
      </button>
    );
  }
  if (lineaActual) {
    return <StepperProducto nombre={producto.nombre} lineaActual={lineaActual} onModificarCantidad={onModificarCantidad} />;
  }
  return (
    <button
      type="button"
      onClick={() => onAgregar(producto)}
      aria-label={`Agregar ${producto.nombre} ${variante === 'mesa' ? 'a la comanda' : 'al pedido'}`}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs shrink-0 cursor-pointer"
    >
      <Plus className="w-5 h-5" aria-hidden="true" />
    </button>
  );
};

/**
 * Tarjeta de producto de carta con control táctil para agregar o ajustar unidades.
 */
export const TarjetaProductoCatalogo: React.FC<TarjetaProductoCatalogoProps> = ({
  producto,
  lineaActual,
  variante,
  esMozo = false,
  onAgregar,
  onModificarCantidad,
}) => {
  const estaAgotado = Boolean(producto.agotado);
  const esMesa = variante === 'mesa';

  return (
    <Card className={`handed-card p-3.5 flex items-center justify-between gap-3 shadow-xs select-none ${estaAgotado ? 'opacity-60 bg-surface/50' : ''}`}>
      <div className="handed-card-info flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className={esMesa ? 'text-sm font-bold text-ink leading-snug' : 'text-sm font-bold text-ink'}>{producto.nombre}</h3>
          {estaAgotado && (
            <span className="text-xs font-bold bg-danger-bg text-danger border border-danger-border px-1.5 py-0.5 rounded">Agotado</span>
          )}
        </div>
        {esMesa && esMozo ? (
          <p className="text-xs font-semibold text-ink-muted mt-1">{producto.categoria}</p>
        ) : (
          <p className={`text-xs font-extrabold text-accent ${esMesa ? 'mt-1' : 'mt-0.5'} tabular-nums`}>{formatCurrency(producto.precio)}</p>
        )}
      </div>
      <BotonAccionProducto producto={producto} lineaActual={lineaActual} variante={variante} onAgregar={onAgregar} onModificarCantidad={onModificarCantidad} />
    </Card>
  );
};
