import React from 'react';
import { Smartphone } from 'lucide-react';
import { SolesIcon } from '../../ui/SolesIcon';
import type { VentaDetalle } from '../../../types/venta';
import { formatCurrency } from '../../../utils/formatters';

export interface VentaDesgloseFiscalProps {
  venta: VentaDetalle;
}

export const VentaDesgloseFiscal: React.FC<VentaDesgloseFiscalProps> = ({ venta }) => {
  return (
    <div className="p-3.5 bg-amber-50/30 rounded-xl border border-amber-200/60 text-xs space-y-3">
      {/* Desglose Tributario */}
      <div className="space-y-1 pb-2 border-b border-amber-200/50 text-xs">
        <div className="flex items-center justify-between text-neutral-600">
          <span>Op. Gravada (Base imponible):</span>
          <span className="tabular-nums font-semibold text-neutral-800">
            {formatCurrency(venta.opGravada ?? Number((venta.total / 1.18).toFixed(2)))}
          </span>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <span>I.G.V. (18%):</span>
          <span className="tabular-nums font-semibold text-neutral-800">
            {formatCurrency(venta.igv ?? Number((venta.total - (venta.total / 1.18)).toFixed(2)))}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm pt-1 border-t border-amber-200/30">
          <span className="font-bold text-ink">TOTAL COBRADO:</span>
          <span className="font-sans font-bold text-lg text-accent tabular-nums whitespace-nowrap">
            {formatCurrency(venta.total)}
          </span>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-neutral-600">
        <div>
          <span className="text-neutral-500 block uppercase font-medium">Método de Pago</span>
          <span className="font-bold text-ink flex items-center gap-1 mt-0.5">
            {venta.metodo === 'Efectivo' ? (
              <>
                <SolesIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Efectivo</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-purple-700" />
                <span>Yape / QR</span>
              </>
            )}
          </span>
        </div>
        {venta.metodo === 'Efectivo' ? (
          <>
            <div>
              <span className="text-neutral-500 block uppercase font-medium">Monto Recibido</span>
              <span className="font-semibold text-neutral-800 tabular-nums">
                {formatCurrency(venta.montoRecibido ?? venta.total)}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase font-medium">Vuelto Entregado</span>
              <span className="font-semibold text-neutral-800 tabular-nums">
                {formatCurrency(venta.vuelto)}
              </span>
            </div>
          </>
        ) : (
          <div>
            <span className="text-neutral-500 block uppercase font-medium">Ref. Yape</span>
            <span className="font-semibold text-neutral-800 tabular-nums">
              {venta.yapeReferencia || 'No registrada'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
