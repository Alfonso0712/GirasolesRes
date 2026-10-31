import React from 'react';
import { CheckCircle2, Download, Printer } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { CerrarCajaResponseDto } from '../../../types/caja';

export interface CierreExitoSectionProps {
  resultadoCierre: CerrarCajaResponseDto;
  descargandoPdf: boolean;
  onDescargarPdf: () => void;
}

export const CierreExitoSection: React.FC<CierreExitoSectionProps> = ({
  resultadoCierre,
  descargandoPdf,
  onDescargarPdf,
}) => {
  return (
    <div className="space-y-6 py-2">
      <div className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
        <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-base font-bold text-green-900">
            {resultadoCierre.mensaje || 'Caja cerrada exitosamente.'}
          </h3>
          <p className="text-xs text-green-800 mt-1">
            El balance contable fue asentado en auditoría. No se permiten más cobros hasta la próxima apertura de caja.
          </p>
        </div>
      </div>

      {/* Tarjetas de Balance Final */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Monto Inicial
          </p>
          <p className="text-base font-bold text-ink tabular-nums mt-0.5">
            {formatCurrency(resultadoCierre.montoInicial)}
          </p>
        </div>
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Efectivo Esperado
          </p>
          <p className="text-base font-bold text-ink tabular-nums mt-0.5">
            {formatCurrency(resultadoCierre.efectivoEsperado)}
          </p>
        </div>
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Efectivo Contado
          </p>
          <p className="text-base font-bold text-ink tabular-nums mt-0.5">
            {formatCurrency(resultadoCierre.efectivoContado)}
          </p>
        </div>
        <div
          className={`p-3 border rounded-xl text-center ${
            resultadoCierre.diferencia === 0
              ? 'bg-green-50 border-green-200 text-green-800'
              : resultadoCierre.diferencia > 0
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider">
            Diferencia
          </p>
          <p className="text-base font-bold tabular-nums mt-0.5">
            {resultadoCierre.diferencia === 0
              ? 'Cuadra'
              : <span className="tabular-nums">{`${resultadoCierre.diferencia > 0 ? '+' : ''}S/ ${resultadoCierre.diferencia.toFixed(2)}`}</span>}
          </p>
        </div>
      </div>

      {/* Botones de Entregable */}
      <div className="p-4 bg-surface-warm border border-neutral-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-neutral-600 font-semibold">
          Descargue o imprima el voucher de balance para el registro físico del restaurante (reemplaza el cuaderno).
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDescargarPdf}
            disabled={descargandoPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-[#B94600] disabled:bg-neutral-400 disabled:cursor-not-allowed rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            {descargandoPdf ? 'DESCARGANDO...' : 'DESCARGAR PDF'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};
