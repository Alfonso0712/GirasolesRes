import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  AlertTriangle,
  X,
  Calendar,
  User,
  Clock,
  Loader2,
} from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import type { CierreDetalleDto } from '../../types/caja';
import { formatCurrency, formatLimaFecha } from '../../utils/formatters';
import {
  CierreMetricasSection,
  CierreProductosConsolidadoSection,
  CierreAnulacionesSection,
} from './cierre-detalle';


interface CierreDetalleModalProps {
  cajaId: string | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export const CierreDetalleModal: React.FC<CierreDetalleModalProps> = ({
  cajaId,
  isOpen,
  onClose,
  token,
}) => {
  const [detalle, setDetalle] = useState<CierreDetalleDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [descargandoPdf, setDescargandoPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && cajaId) {
      setCargando(true);
      setError(null);
      cajaService
        .obtenerDetalleCierre(cajaId, token)
        .then((data) => setDetalle(data))
        .catch((err) => setError(err.message || 'Error al obtener detalle del cierre.'))
        .finally(() => setCargando(false));
    } else {
      setDetalle(null);
    }
  }, [isOpen, cajaId, token]);

  // Focus trap y tecla Escape global
  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !cajaId) return null;

  const handleDescargarPdf = async () => {
    if (descargandoPdf) return;
    if (!cajaId) return;
    setDescargandoPdf(true);
    try {
      const downloadFn =
        (cajaService as any).descargarPdfCierre || cajaService.descargarCierrePdf;
      await downloadFn.call(cajaService, cajaId, token);
    } catch (err: any) {
      alert(err.message || 'Error al descargar el PDF del cierre.');
    } finally {
      setDescargandoPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };


  const tieneAjustes = Boolean(
    detalle?.tieneAjustesPosteriores ||
      detalle?.conAjustes ||
      (detalle?.ajustesPosteriores && detalle.ajustesPosteriores.length > 0)
  );

  const esAbierta = Boolean(
    detalle?.estado?.toLowerCase() === 'abierta' ||
      (!detalle?.fechaCierre &&
        detalle?.efectivoContado === null &&
        detalle?.montoInicial !== undefined)
  );

  const diferenciaNum =
    detalle?.diferencia !== null && detalle?.diferencia !== undefined
      ? Number(detalle.diferencia)
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-cierre-title"
      className="cierre-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .cierre-modal-container, .cierre-modal-container * {
            visibility: visible;
          }
          .cierre-modal-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .cierre-modal-overlay {
            position: static !important;
            background: none !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div
        ref={modalRef}
        className="cierre-modal-container bg-surface border border-neutral-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-ink animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent border border-amber-200/80 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                Historial de Caja
              </p>
              <h2 id="detalle-cierre-title" className="font-sans text-xl font-bold text-ink tracking-tight">
                Detalle de Cierre de Caja
              </h2>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="no-print modal-close-btn"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-ink">
          {cargando ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-500">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-sm font-semibold">Cargando detalle del cierre…</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-1">
              <p className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Error al cargar detalle
              </p>
              <p>{error}</p>
            </div>
          ) : detalle ? (
            <>
              {/* Alerta de Ajustes Posteriores por Anulación */}
              {tieneAjustes && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-950 animate-fade-in break-inside-avoid">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-amber-900 block">
                      Turno con ventas anuladas después del cierre
                    </span>
                    <p className="text-amber-800 leading-relaxed">
                      Se registraron anulaciones posteriores en este turno. El arqueo original de caja se conserva para auditoría y las ventas anuladas se detallan a continuación.
                    </p>
                  </div>
                </div>
              )}

              {/* Sección 1: Metadatos del Turno (Apertura y Cierre en formato Lima) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs break-inside-avoid">
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-neutral-200 pb-3 sm:pb-0 sm:pr-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" /> Apertura del Turno
                  </span>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">
                    {detalle.fechaAperturaLocal || formatLimaFecha(detalle.fechaApertura)}
                  </p>
                  <p className="text-neutral-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-500" />
                    Cajero(a): <strong>{detalle.cajeroApertura || 'Cajero'}</strong>
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Fondo inicial: <strong className="text-neutral-800 tabular-nums">{formatCurrency(detalle.montoInicial)}</strong>
                  </p>
                </div>

                <div className="space-y-1.5 pt-1 sm:pt-0 sm:pl-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" /> Cierre y Cuadre
                  </span>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">
                    {detalle.fechaCierreLocal ||
                      (detalle.fechaCierre
                        ? formatLimaFecha(detalle.fechaCierre)
                        : 'Turno en curso (Abierta)')}
                  </p>
                  <p className="text-neutral-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-500" />
                    Cerrado por: <strong>{detalle.cajeroCierre || '—'}</strong>
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Transacciones: <strong className="text-neutral-800">{detalle.cantidadVentas ?? 0} ventas emitidas</strong>
                  </p>
                </div>
              </div>

              {/* Sección 2: Desglose Financiero Completo (8 Métricas Clave) */}
              <CierreMetricasSection
                detalle={detalle}
                esAbierta={esAbierta}
                diferenciaNum={diferenciaNum}
              />

              {/* Sección 3: Observación (Omitida limpiamente si está vacía) */}
              {detalle.observacion && detalle.observacion.trim().length > 0 && (
                <div className="p-3.5 bg-stone-50 border border-neutral-200 rounded-xl text-xs break-inside-avoid">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Observación del cierre
                  </span>
                  <p className="text-neutral-800 italic font-medium">"{detalle.observacion.trim()}"</p>
                </div>
              )}

              {/* Sección 4: Consolidado en Tres Bloques (D-017, RN-138, E-401) */}
              <CierreProductosConsolidadoSection detalle={detalle} />

              {/* Sección 5: Ventas anuladas después del cierre */}
              {tieneAjustes && (
                <CierreAnulacionesSection ajustesPosteriores={detalle.ajustesPosteriores} />
              )}
            </>
          ) : null}
        </div>

        {/* Footer con Botones de Acción */}
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
              onClick={handlePrint}
              disabled={cargando || !detalle}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-surface border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 rounded-xl transition-colors cursor-pointer min-h-[44px]"
              title="Imprimir resumen mediante diálogo del navegador"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>

            <button
              type="button"
              onClick={handleDescargarPdf}
              disabled={cargando || !detalle || descargandoPdf || esAbierta}
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
      </div>
    </div>
  );
};

export default CierreDetalleModal;
