import React from 'react';
import { Plus, Minus, Trash2, FileText } from 'lucide-react';
import type { LineaBorrador } from '../../types/pedido';
import { formatCurrency } from '../../utils/format';

export interface FilaLineaComandaProps {
  linea: LineaBorrador;
  variante: 'mesa' | 'llevar';
  esMozo?: boolean;
  onModificarCantidad: (lineaId: string, delta: number) => void;
  onEditarNota: (linea: LineaBorrador) => void;
}

const EleccionesLinea: React.FC<{ linea: LineaBorrador }> = ({ linea }) => {
  if (!linea.elecciones || linea.elecciones.length === 0) return null;
  return (
    <div className="text-xs text-ink-muted bg-canvas p-1.5 rounded-lg border border-line space-y-0.5 mt-1">
      {linea.elecciones.map((el) => (
        <div key={el.parte} className="flex justify-between gap-2">
          <span className="font-semibold text-ink shrink-0">{el.parte}:</span>
          <span className="text-ink-muted text-right min-w-0">{el.productoNombre}</span>
        </div>
      ))}
    </div>
  );
};

const BotonesCantidadLinea: React.FC<{
  linea: LineaBorrador;
  onModificarCantidad: (lineaId: string, delta: number) => void;
}> = ({ linea, onModificarCantidad }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <button
      type="button"
      onClick={() => onModificarCantidad(linea.id, -1)}
      aria-label={linea.cantidad === 1 ? `Eliminar ${linea.nombre} de la orden` : `Disminuir cantidad de ${linea.nombre}`}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas text-danger flex items-center justify-center border border-line active:scale-95 transition-transform cursor-pointer"
    >
      {linea.cantidad === 1 ? <Trash2 className="w-4 h-4" aria-hidden="true" /> : <Minus className="w-4 h-4" aria-hidden="true" />}
    </button>
    <span className="text-sm font-black min-w-[24px] text-center tabular-nums">{linea.cantidad}</span>
    <button
      type="button"
      onClick={() => onModificarCantidad(linea.id, 1)}
      aria-label={`Aumentar cantidad de ${linea.nombre}`}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
    >
      <Plus className="w-4 h-4" aria-hidden="true" />
    </button>
  </div>
);

const CLASES_VARIANTE = {
  mesa: {
    fila: 'py-3 space-y-2',
    cabecera: 'flex justify-between items-start gap-3',
    titulo: 'text-sm font-bold text-ink',
    precio: 'text-xs text-ink-muted',
    pie: 'flex items-center gap-2 pt-1',
    botonNota: 'text-xs font-bold text-accent hover:underline flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-surface border border-line cursor-pointer',
  },
  llevar: {
    fila: 'py-2.5 space-y-1.5',
    cabecera: 'flex justify-between items-start gap-3 text-xs',
    titulo: 'font-bold text-ink',
    precio: 'text-ink-muted mt-0.5',
    pie: 'flex items-center gap-2 pt-0.5',
    botonNota: 'text-xs font-bold text-accent hover:underline flex items-center gap-1.5 py-1 px-2 rounded-lg bg-surface border border-line cursor-pointer',
  },
} as const;

const BotonNotaLinea: React.FC<{
  linea: LineaBorrador;
  clasePie: string;
  claseBoton: string;
  onEditarNota: (linea: LineaBorrador) => void;
}> = ({ linea, clasePie, claseBoton, onEditarNota }) => (
  <div className={clasePie}>
    <button type="button" onClick={() => onEditarNota(linea)} aria-label={`Nota de cocina para ${linea.nombre}`} className={claseBoton}>
      <FileText className="w-3.5 h-3.5" />
      <span>{linea.observacion ? 'Modificar nota' : 'Agregar nota'}</span>
    </button>
    {linea.observacion && (
      <span className="text-xs text-ink-muted italic line-clamp-2 flex-1 min-w-0">"{linea.observacion}"</span>
    )}
  </div>
);

/**
 * Fila presentacional de una línea dentro del panel de comanda / orden para llevar.
 */
export const FilaLineaComanda: React.FC<FilaLineaComandaProps> = ({
  linea,
  variante,
  esMozo = false,
  onModificarCantidad,
  onEditarNota,
}) => {
  const c = CLASES_VARIANTE[variante];

  return (
    <div className={c.fila}>
      <div className={c.cabecera}>
        <div className="min-w-0 flex-1">
          <h4 className={c.titulo}>{linea.nombre}</h4>
          <EleccionesLinea linea={linea} />
          {!esMozo && (
            <p className={c.precio}>
              {formatCurrency(linea.precioUnitario)} x {linea.cantidad} ={' '}
              <span className="font-bold text-ink">{formatCurrency(linea.subtotal)}</span>
            </p>
          )}
        </div>
        <BotonesCantidadLinea linea={linea} onModificarCantidad={onModificarCantidad} />
      </div>
      <BotonNotaLinea linea={linea} clasePie={c.pie} claseBoton={c.botonNota} onEditarNota={onEditarNota} />
    </div>
  );
};
