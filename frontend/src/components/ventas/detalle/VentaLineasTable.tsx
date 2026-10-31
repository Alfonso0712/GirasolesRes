import React from 'react';
import { Utensils } from 'lucide-react';
import type { LineaVentaDetalle } from '../../../types/venta';
import { formatCurrency } from '../../../utils/formatters';

export interface VentaLineasTableProps {
  lineas: LineaVentaDetalle[];
}

export const VentaLineasTable: React.FC<VentaLineasTableProps> = ({ lineas }) => {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-2 flex items-center gap-1.5">
        <Utensils className="w-3.5 h-3.5 text-accent" />
        <span>Platos y Bebidas Consumidos</span>
      </h3>
      <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-canvas text-ink-muted font-semibold text-xs uppercase tracking-wider border-b border-line">
            <tr>
              <th className="py-2.5 px-3 text-left w-14">Cant.</th>
              <th className="py-2.5 px-3 text-left">Descripción</th>
              <th className="py-2.5 px-3 text-right w-24">P. Unit.</th>
              <th className="py-2.5 px-3 text-right w-24">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft bg-surface text-sm">
            {lineas.map((linea, idx) => (
              <tr key={`${linea.productoNombre}-${linea.precioUnitario}-${linea.cantidad}-${idx}`} className="hover:bg-neutral-50/50 border-b border-line-soft">
                <td className="py-2.5 px-3 tabular-nums font-semibold text-center text-ink text-sm">
                  {linea.cantidad}
                </td>
                <td className="py-2.5 px-3">
                  <span className="font-semibold text-sm text-ink">{linea.productoNombre}</span>
                  {linea.elecciones && (
                    <span className="text-xs text-stone-500 italic block mt-0.5">
                      {linea.elecciones}{linea.incluye ? ` (incluye ${linea.incluye})` : ''}
                    </span>
                  )}
                  {linea.observacion && (
                    <span className="text-xs text-stone-500 block mt-0.5">
                      Obs: {linea.observacion}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums text-sm text-stone-600">
                  {formatCurrency(linea.precioUnitario)}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-sm text-ink">
                  {formatCurrency(linea.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
