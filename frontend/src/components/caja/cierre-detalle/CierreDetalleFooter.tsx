import React from 'react';
import { Download, Printer, Loader2 } from 'lucide-react';

export interface CierreDetalleFooterProps {
  onClose: () => void;
  onPrint: () => void;
  onDescargarPdf: () => void;
  cargando: boolean;
  tieneDetalle: boolean;
  descargandoPdf: boolean;
  esAbierta: boolean;
}

export const CierreDetalleFooter: React.FC<CierreDetalleFooterProps> = ({
  onClose,
  onPrint,
  onDescargarPdf,
  cargando,
  tieneDetalle,
  descargandoPdf,
  esAbierta,
}) => {
  return (
    <div className="no-print bg-neutral-50/80 border-t border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 text-xs font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
      >
        Cerrar
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrint}
          disabled={cargando || !tieneDetalle}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-surface border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 rounded-xl transition-colors cursor-pointer min-h-[44px]"
          title="Imprimir resumen mediante diálogo del navegador"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>

        <button
          type="button"
          onClick={onDescargarPdf}
          disabled={cargando || !tieneDetalle || descargandoPdf || esAbierta}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover disabled:bg-stone-300 disabled:cursor-not-allowed rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
          title={esAbierta ? 'No disponible mientras la caja esté abierta' : 'Descargar comprobante oficial en formato PDF'}
        >
          {descargandoPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando PDF…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Descargar comprobante PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
