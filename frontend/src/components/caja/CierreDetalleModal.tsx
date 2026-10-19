import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  Utensils,
  AlertTriangle,
  X,
  Calendar,
  User,
  Clock,
  DollarSign,
  Banknote,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import type { CierreDetalleDto } from '../../types/caja';

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

  const formatLimaFecha = (fechaUtc?: string | null): string => {
    if (!fechaUtc) return '—';
    try {
      const d = new Date(fechaUtc);
      if (isNaN(d.getTime())) return fechaUtc;
      return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return fechaUtc;
    }
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
      className="cierre-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
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
        className="cierre-modal-container bg-[#FFFDF9] border border-[#E6D7C3] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#482813]"
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-[#482813] to-[#5C341A] px-6 py-4 flex items-center justify-between text-white border-b border-[#3D2110] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D35400] flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#F39C12]">
                HISTORIAL DE CAJA
              </p>
              <h2 id="detalle-cierre-title" className="font-sans text-xl font-bold text-white">
                Detalle de Cierre de Caja
              </h2>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="no-print text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-[#482813]">
          {cargando ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-8 h-8 text-[#D35400] animate-spin" />
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
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-amber-900 block">
                      Cierre con ajustes posteriores (RN-113)
                    </span>
                    <p className="text-amber-800 leading-relaxed">
                      Una o más ventas correspondientes a este turno fueron anuladas con posterioridad al cierre de caja; el arqueo y balance histórico original permanecen estrictamente inmutables; las ventas anuladas se detallan en la sección de auditoría al final.
                    </p>
                  </div>
                </div>
              )}

              {/* Sección 1: Metadatos del Turno (Apertura y Cierre en formato Lima) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl text-xs break-inside-avoid">
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-[#E6D7C3] pb-3 sm:pb-0 sm:pr-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D35400]" /> Apertura del Turno
                  </span>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">
                    {detalle.fechaAperturaLocal || formatLimaFecha(detalle.fechaApertura)}
                  </p>
                  <p className="text-stone-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    Cajero(a): <strong>{detalle.cajeroApertura || 'Cajero'}</strong>
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    Fondo inicial: <strong className="text-stone-800 tabular-nums">S/ {(detalle.montoInicial ?? 0).toFixed(2)}</strong>
                  </p>
                </div>

                <div className="space-y-1.5 pt-1 sm:pt-0 sm:pl-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D35400]" /> Cierre y Cuadre
                  </span>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">
                    {detalle.fechaCierreLocal ||
                      (detalle.fechaCierre
                        ? formatLimaFecha(detalle.fechaCierre)
                        : 'Turno en curso (Abierta)')}
                  </p>
                  <p className="text-stone-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    Cerrado por: <strong>{detalle.cajeroCierre || '—'}</strong>
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    Transacciones: <strong className="text-stone-800">{detalle.cantidadVentas ?? 0} ventas emitidas</strong>
                  </p>
                </div>
              </div>

              {/* Sección 2: Desglose Financiero Completo (8 Métricas Clave) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid">
                {/* Tarjeta A: Resumen de Ventas Facturadas */}
                <div className="p-4 bg-white border border-[#E6D7C3] rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E6D7C3] pb-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#482813] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#D35400]" />
                      Flujo de Ventas del Turno
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-stone-600">
                      <span>Monto Inicial (Apertura):</span>
                      <span className="font-bold text-stone-800 tabular-nums">
                        S/ {(detalle.montoInicial ?? 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-600">
                      <span className="flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5 text-stone-400" />
                        Ventas en Efectivo:
                      </span>
                      <span className="font-bold text-[#482813] tabular-nums">
                        S/ {(detalle.ventasEfectivo ?? 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-600">
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                        Ventas por Yape / QR:
                      </span>
                      <span className="font-bold text-purple-900 tabular-nums">
                        S/ {(detalle.ventasYape ?? 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E6D7C3] flex justify-between items-center font-bold text-sm">
                      <span className="text-[#482813]">TOTAL VENTAS FACTURADAS:</span>
                      <span className="text-[#D35400] text-base tabular-nums">
                        S/ {(detalle.totalVentas ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta B: Arqueo Físico y Cuadratura de Efectivo */}
                <div className="p-4 bg-white border border-[#E6D7C3] rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E6D7C3] pb-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#482813] flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-[#D35400]" />
                      Arqueo y Cuadratura de Efectivo
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-stone-600">
                      <span>Efectivo Físico Esperado:</span>
                      <span className="font-bold text-[#482813] tabular-nums">
                        S/ {(detalle.efectivoEsperado ?? (detalle.montoInicial + detalle.ventasEfectivo)).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-600">
                      <span>Efectivo Físico Contado:</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {esAbierta ? (
                          <span className="text-stone-400 font-normal">—</span>
                        ) : detalle.efectivoContado !== null && detalle.efectivoContado !== undefined ? (
                          <span className="tabular-nums">S/ {Number(detalle.efectivoContado).toFixed(2)}</span>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-600">
                      <span>Diferencia de Cuadre:</span>
                      <span className="font-bold tabular-nums">
                        {esAbierta ? (
                          <span className="text-stone-400 font-normal">—</span>
                        ) : diferenciaNum === null ? (
                          '—'
                        ) : diferenciaNum === 0 ? (
                          <span className="tabular-nums">S/ 0.00</span>
                        ) : (
                          <span className="tabular-nums">{`${diferenciaNum > 0 ? '+' : ''}S/ ${diferenciaNum.toFixed(2)}`}</span>
                        )}
                      </span>
                    </div>

                    {/* Badge de Estado de Cuadre */}
                    <div className="pt-2 border-t border-[#E6D7C3]">
                      <div
                        className={`p-2.5 rounded-lg border text-center font-black text-xs tracking-wider uppercase tabular-nums ${
                          esAbierta
                            ? 'bg-stone-50 border-stone-200 text-stone-500'
                            : diferenciaNum === null
                            ? 'bg-stone-50 border-stone-200 text-stone-500'
                            : diferenciaNum === 0
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : diferenciaNum > 0
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                        }`}
                      >
                        {esAbierta
                          ? 'Estado: Turno en curso (Sin Arqueo)'
                          : diferenciaNum === null
                          ? 'Estado: Sin Arqueo'
                          : diferenciaNum === 0
                          ? 'Estado: Cuadra (S/ 0.00)'
                          : diferenciaNum > 0
                          ? <span className="tabular-nums">{`Estado: Sobrante (+S/ ${diferenciaNum.toFixed(2)})`}</span>
                          : <span className="tabular-nums">{`Estado: Faltante (-S/ ${Math.abs(diferenciaNum).toFixed(2)})`}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Observación (Omitida limpiamente si está vacía) */}
              {detalle.observacion && detalle.observacion.trim().length > 0 && (
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs break-inside-avoid">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Observación Registrada al Cierre de Caja
                  </span>
                  <p className="text-stone-800 italic font-medium">"{detalle.observacion.trim()}"</p>
                </div>
              )}

              {/* Sección 4: Consolidado de Platos Vendidos (Tabla con cabecera y totales) */}
              <div className="border border-[#E6D7C3] rounded-xl overflow-hidden bg-white break-inside-avoid shadow-xs">
                <div className="bg-[#FAF6F0] px-4 py-2.5 border-b border-[#E6D7C3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#D35400]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#482813]">
                      Consolidado de Platos y Productos Vendidos
                    </h4>
                  </div>
                  <span className="text-xs text-stone-500 font-semibold">
                    {detalle.platosVendidos?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0} unidades
                  </span>
                </div>

                {detalle.platosVendidos && detalle.platosVendidos.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF6F0]/60 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider sticky top-0">
                        <tr>
                          <th className="px-4 py-2">Plato / Producto</th>
                          <th className="px-4 py-2 text-center w-24">Cantidad</th>
                          <th className="px-4 py-2 text-right w-28 tabular-nums">Subtotal (S/)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {detalle.platosVendidos.map((p, idx) => (
                          <tr key={p.productoId || `${p.nombre}-${idx}`} className="hover:bg-[#FAF6F0]/40 transition-colors">
                            <td className="px-4 py-2 font-medium text-stone-800">{p.nombre}</td>
                            <td className="px-4 py-2 text-center font-semibold text-stone-700 tabular-nums">
                              {p.cantidad}
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-[#482813] tabular-nums">
                              S/ {(p.total ?? 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#FAF6F0] border-t border-[#E6D7C3] font-bold text-xs">
                        <tr>
                          <td className="px-4 py-2 text-[#482813]">TOTAL CONSOLIDADO</td>
                          <td className="px-4 py-2 text-center text-stone-800 tabular-nums">
                            {detalle.platosVendidos.reduce((acc, p) => acc + p.cantidad, 0)}
                          </td>
                          <td className="px-4 py-2 text-right text-[#D35400] tabular-nums">
                            S/ {detalle.platosVendidos.reduce((acc, p) => acc + (p.total ?? 0), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-stone-500 italic">
                    Sin ventas de platos registradas en este turno.
                  </div>
                )}
              </div>

              {/* Sección 5: Ventas Anuladas Posteriores al Cierre (RN-113) */}
              {tieneAjustes && detalle.ajustesPosteriores && detalle.ajustesPosteriores.length > 0 && (
                <div className="border border-amber-200 bg-amber-50/40 rounded-xl overflow-hidden break-inside-avoid">
                  <div className="bg-amber-100/70 px-4 py-2.5 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      Ventas Anuladas Posteriores al Cierre ({detalle.ajustesPosteriores.length})
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold">
                      Inmutabilidad garantizada
                    </span>
                  </div>

                  <div className="p-3 bg-amber-100/30 border-b border-amber-200/60 text-[11px] text-amber-900 leading-normal">
                    <strong>Nota de Auditoría per RN-113:</strong> El balance de arqueo original permanece inalterado. Estas anulaciones ocurrieron después de cerrarse el turno para regularizar pedidos.
                  </div>

                  <div className="divide-y divide-amber-200/60 text-xs">
                    {detalle.ajustesPosteriores.map((a) => (
                      <div key={a.ventaId} className="p-3.5 hover:bg-amber-100/30 transition-colors space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#482813]">
                            {a.comprobante || a.numeroComprobante || 'Comprobante'}
                          </span>
                          <span className="font-bold text-red-600 tabular-nums">
                            -S/ {Number(a.montoAnulado ?? a.total ?? 0).toFixed(2)} ({a.metodoPago})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-600 gap-2">
                          <p>
                            Motivo: <em className="text-stone-800 font-medium">"{a.motivo || 'Sin motivo'}"</em>
                          </p>
                          <p className="text-stone-500">
                            Anulado por: <strong>{a.usuarioAnulacion || 'Mozo/Admin'}</strong> ·{' '}
                            {a.fechaAnulacionLocal || formatLimaFecha(a.fechaAnulacion || a.fechaAnulacionUtc)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer con Botones de Acción */}
        <div className="no-print bg-[#F5EBE1] border-t border-[#E6D7C3] p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDescargarPdf}
              disabled={cargando || !detalle || descargandoPdf || esAbierta}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#D35400] hover:bg-[#B94600] disabled:bg-stone-300 disabled:cursor-not-allowed rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
              title={esAbierta ? 'No disponible mientras la caja esté abierta' : 'Descargar comprobante oficial en formato PDF'}
            >
              {descargandoPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  GENERANDO PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  DESCARGAR PDF
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={cargando || !detalle}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 disabled:opacity-40 rounded-xl transition-colors cursor-pointer min-h-[44px]"
              title="Imprimir resumen mediante diálogo del navegador"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CierreDetalleModal;
