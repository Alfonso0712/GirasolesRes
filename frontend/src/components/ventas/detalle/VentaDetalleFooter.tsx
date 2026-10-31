import React from 'react';
import { Download, Ban } from 'lucide-react';
import type { VentaDetalle } from '../../../types/venta';

export interface VentaDetalleFooterProps {
  venta: VentaDetalle | null;
  loading: boolean;
  esAdmin: boolean;
  descargandoTicket: boolean;
  onDescargarTicket: (ventaId: string, esCopia?: boolean) => Promise<void>;
  onAbrirAnular: () => void;
  onClose: () => void;
}

export const VentaDetalleFooter: React.FC<VentaDetalleFooterProps> = ({
  venta,
  loading,
  esAdmin,
  descargandoTicket,
  onDescargarTicket,
  onAbrirAnular,
  onClose,
}) => {
  const esAnulada = venta?.estado === 'Anulada';

  return (
    <div className="pt-3 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2">
        {/* Botón Descargar PDF (RV-117, RN-104) */}
        <button
          type="button"
          disabled={loading || !venta || descargandoTicket}
          onClick={() => venta && onDescargarTicket(venta.ventaId, true)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-accent" />
          <span>{descargandoTicket ? 'Descargando PDF...' : 'Descargar PDF (copia)'}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Botón Anular Venta (RV-112: Solo Admin en ventas Vigentes) */}
        {esAdmin && venta && !esAnulada && (
          <button
            type="button"
            onClick={onAbrirAnular}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Anular venta</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
