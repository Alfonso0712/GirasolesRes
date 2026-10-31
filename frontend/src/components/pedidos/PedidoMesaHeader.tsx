import React from 'react';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import type { MesaItem } from '../../types/mesa';

interface PedidoMesaHeaderProps {
  mesaSeleccionada: MesaItem | null;
  modo: 'nuevo' | 'ampliacion';
  lineasBorradorCount: number;
  onLimpiarBorrador: () => void;
  onVolverAMesas: () => void;
}

export const PedidoMesaHeader: React.FC<PedidoMesaHeaderProps> = ({
  mesaSeleccionada,
  modo,
  lineasBorradorCount,
  onLimpiarBorrador,
  onVolverAMesas,
}) => {
  return (
    <PageHeader
      title="Pedido de Mesa"
      subtitle="Seleccione la mesa y los productos de la carta para generar la comanda a cocina."
      badge={
        <div className="flex items-center gap-2">
          {mesaSeleccionada && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              {mesaSeleccionada.nombre}
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
            {modo === 'ampliacion' ? 'Ampliación' : 'Nuevo pedido'}
          </span>
        </div>
      }
      actions={
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="secondary"
            onClick={onLimpiarBorrador}
            disabled={lineasBorradorCount === 0}
            className="w-auto shrink-0 whitespace-nowrap text-xs font-semibold px-3.5 py-2 min-h-[40px] h-10 inline-flex items-center justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            Limpiar borrador
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onVolverAMesas}
            className="w-auto shrink-0 whitespace-nowrap text-xs font-semibold px-3.5 py-2 min-h-[40px] h-10 inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            Volver a mesas
          </Button>
        </div>
      }
    />
  );
};
