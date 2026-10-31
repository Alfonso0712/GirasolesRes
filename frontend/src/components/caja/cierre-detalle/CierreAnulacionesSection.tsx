import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatLimaFecha } from '../../../utils/formatters';
import type { CierreDetalleDto } from '../../../types/caja';

export interface CierreAnulacionesSectionProps {
  ajustesPosteriores?: CierreDetalleDto['ajustesPosteriores'];
}

export const CierreAnulacionesSection: React.FC<CierreAnulacionesSectionProps> = ({
  ajustesPosteriores,
}) => {
  if (!ajustesPosteriores || ajustesPosteriores.length === 0) {
    return null;
  }

  return (
    <div className="border border-amber-200 bg-amber-50/40 rounded-xl overflow-hidden break-inside-avoid">
      <div className="bg-amber-100/70 px-4 py-2.5 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          Ventas anuladas después del cierre ({ajustesPosteriores.length})
        </span>
        <span className="text-xs text-amber-800 font-semibold">
          Arqueo original protegido
        </span>
      </div>

      <div className="p-3 bg-amber-100/30 border-b border-amber-200/60 text-xs text-amber-900 leading-normal">
        <strong>Nota de auditoría:</strong> El arqueo y balance original de la caja no se modifican. Estas ventas fueron anuladas después de cerrar el turno.
      </div>

      <div className="divide-y divide-amber-200/60 text-xs">
        {ajustesPosteriores.map((a) => (
          <div key={a.ventaId} className="p-3.5 hover:bg-amber-100/30 transition-colors space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink">
                {a.comprobante || a.numeroComprobante || 'Comprobante'}
              </span>
              <span className="font-bold text-red-600 tabular-nums">
                -S/ {Number(a.montoAnulado ?? a.total ?? 0).toFixed(2)} ({a.metodoPago})
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
              <p>
                Motivo: <em className="text-neutral-800 font-medium">"{a.motivo || 'Sin motivo'}"</em>
              </p>
              <p className="text-neutral-500">
                Anulado por: <strong>{a.usuarioAnulacion || 'Mozo/Admin'}</strong> ·{' '}
                {a.fechaAnulacionLocal || formatLimaFecha(a.fechaAnulacion || a.fechaAnulacionUtc)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
