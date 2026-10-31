import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Lock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  X,
} from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import { ContadorDenominacionesModal } from './ContadorDenominacionesModal';
import type { CierreResumenDto, CerrarCajaResponseDto } from '../../types/caja';
import { formatCurrency } from '../../utils/formatters';
import {
  ResumenContableCards,
  ArqueoEfectivoSection,
  CerrarCajaDesgloseSection,
  ConfirmarCierreModal,
} from './cerrar-caja';


export interface CerrarCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCierreCompletado: () => void;
  token: string;
  onCobrarPedido?: (pedidoId: string) => void;
}

export const CerrarCajaModal: React.FC<CerrarCajaModalProps> = ({
  isOpen,
  onClose,
  onCierreCompletado,
  token,
  onCobrarPedido,
}) => {
  const [cargandoResumen, setCargandoResumen] = useState<boolean>(true);
  const [resumen, setResumen] = useState<CierreResumenDto | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Formulario
  const [efectivoContadoInput, setEfectivoContadoInput] = useState<string>('');
  const [observacion, setObservacion] = useState<string>('');
  const [contadorModalOpen, setContadorModalOpen] = useState<boolean>(false);

  // Pasos de UI
  const [pasoConfirmacion, setPasoConfirmacion] = useState<boolean>(false);
  const [procesandoCierre, setProcesandoCierre] = useState<boolean>(false);
  const [descargandoPdf, setDescargandoPdf] = useState<boolean>(false);
  const [resultadoCierre, setResultadoCierre] = useState<CerrarCajaResponseDto | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const inputContadoRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);

  // Cargar resumen contable al abrir
  const cargarResumen = useCallback(async () => {
    setCargandoResumen(true);
    setErrorCarga(null);
    setErrorServidor(null);
    setPasoConfirmacion(false);
    setResultadoCierre(null);

    try {
      const data = await cajaService.obtenerResumenCierre(token);
      setResumen(data);
      // Pre-sugerir contado vacío para que el cajero cuente conscientemente
      setEfectivoContadoInput('');
      setObservacion('');
    } catch (err: any) {
      setErrorCarga(err.message || 'Error al obtener el resumen de cierre.');
    } finally {
      setCargandoResumen(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      cargarResumen();
    } else {
      setResultadoCierre(null);
      setErrorCarga(null);
      setErrorServidor(null);
      setPasoConfirmacion(false);
    }
  }, [isOpen, cargarResumen]);

  // Foco inicial en input de efectivo contado al abrir
  useEffect(() => {
    if (isOpen && !pasoConfirmacion && !resultadoCierre && !cargandoResumen) {
      setTimeout(() => {
        inputContadoRef.current?.focus();
      }, 50);
    }
  }, [isOpen, pasoConfirmacion, resultadoCierre, cargandoResumen]);

  // Foco en cancelar cuando se abre el diálogo de confirmación (RV-127 / E-306)
  useEffect(() => {
    if (pasoConfirmacion) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [pasoConfirmacion]);

  // Focus trap y tecla Escape global
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (contadorModalOpen) return; // Contador maneja sus propias teclas

      if (e.key === 'Escape' && !procesandoCierre) {
        e.preventDefault();
        if (pasoConfirmacion) {
          setPasoConfirmacion(false);
        } else {
          onClose();
        }
        return;
      }

      if (e.key === 'Tab') {
        const container = pasoConfirmacion
          ? confirmDialogRef.current || modalRef.current
          : modalRef.current;
        if (!container) return;
        const focusableElements = container.querySelectorAll<HTMLElement>(
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
  }, [isOpen, contadorModalOpen, pasoConfirmacion, procesandoCierre, onClose]);

  // Cálculo de diferencia en vivo
  const contadoNumerico = useMemo(() => {
    if (!efectivoContadoInput.trim()) return null;
    const norm = efectivoContadoInput.replace(',', '.');
    const parsed = parseFloat(norm);
    return isNaN(parsed) || parsed < 0 ? null : Math.round(parsed * 100) / 100;
  }, [efectivoContadoInput]);

  const diferenciaCalculada = useMemo(() => {
    if (resumen === null || contadoNumerico === null) return null;
    return Math.round((contadoNumerico - resumen.efectivoEsperado) * 100) / 100;
  }, [resumen, contadoNumerico]);

  if (!isOpen) return null;

  const tienePedidosPendientes = (resumen?.pedidosPendientes?.length ?? 0) > 0;

  const validarCierre = (): { contado: number; obs: string } | null => {
    if (contadoNumerico === null) {
      setErrorServidor('Ingrese el efectivo contado.'); // MSG-175
      return null;
    }

    if (contadoNumerico > 99999.99) {
      setErrorServidor('El monto no puede superar S/ 99,999.99.'); // MSG-171 tabular-nums
      return null;
    }

    if (observacion.length > 200) {
      setErrorServidor('La observación no puede superar los 200 caracteres.'); // MSG-179
      return null;
    }

    setErrorServidor(null);
    return { contado: contadoNumerico, obs: observacion.trim() };
  };

  const handleAvanzarConfirmacion = () => {
    const v = validarCierre();
    if (v !== null) {
      setPasoConfirmacion(true);
    }
  };

  const handleConfirmarCierre = async () => {
    if (procesandoCierre) return; // Guard contra doble clic rápido (RV-121, E-309)

    const v = validarCierre();
    if (v === null || !resumen) {
      setPasoConfirmacion(false);
      return;
    }

    setProcesandoCierre(true);
    setErrorServidor(null);

    try {
      const solicitudId = crypto.randomUUID();
      const res = await cajaService.cerrarCaja(
        {
          solicitudId,
          efectivoContado: v.contado,
          efectivoEsperadoMostrado: resumen.efectivoEsperado,
          observacion: v.obs || undefined,
        },
        token
      );

      setResultadoCierre(res);
      setPasoConfirmacion(false);
      onCierreCompletado();
    } catch (err: any) {
      if (err.codigo === 'caja_concurrencia' || err.codigo === 'totales_cambiaron') {
        // RV-129 / MSG-189
        setErrorServidor(
          err.message || 'Los totales cambiaron mientras contaba. Revise el resumen antes de cerrar.'
        );
        // Recargar resumen preservando el monto contado ingresado
        try {
          const nuevoResumen = await cajaService.obtenerResumenCierre(token);
          setResumen(nuevoResumen);
        } catch {
          // ignore
        }
      } else if (err.codigo === 'pedidos_pendientes') {
        setErrorServidor(
          err.message || 'No se puede cerrar la caja: hay pedidos pendientes de cobro.' // MSG-174
        );
        cargarResumen();
      } else {
        setErrorServidor(err.message || 'No se pudo cerrar la caja. La caja sigue abierta; intente nuevamente.'); // MSG-183
      }
      setPasoConfirmacion(false);
    } finally {
      setProcesandoCierre(false);
    }
  };

  const handleDescargarPdf = async () => {
    const cajaId = resultadoCierre?.cajaId || resumen?.cajaId;
    if (!cajaId || descargandoPdf) return;
    setDescargandoPdf(true);
    try {
      await cajaService.descargarCierrePdf(cajaId, token);
    } catch (err: any) {
      alert(err.message || 'Error al descargar el PDF.');
    } finally {
      setDescargandoPdf(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cerrar-caja-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-surface border border-neutral-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#C0392B] border border-rose-200 flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                Gestión de Caja
              </p>
              <h2 id="cerrar-caja-title" className="font-sans text-xl font-bold text-ink tracking-tight">
                Cierre de Caja y Cuadre de Turno
              </h2>
            </div>
          </div>
          {!procesandoCierre && (
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-ink">
          {resultadoCierre ? (
            /* Vista de Éxito / Entregable de Cierre (RNF-48, MSG-181) */
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
                    onClick={handleDescargarPdf}
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
          ) : cargandoResumen ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold">Calculando resumen contable en vivo…</p>
            </div>
          ) : errorCarga ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Error al cargar datos de la caja</p>
                <p>{errorCarga}</p>
                <button
                  type="button"
                  onClick={cargarResumen}
                  className="mt-2 text-xs font-bold text-red-800 underline cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            /* Vista del Proceso de Cierre */
            <>
              {errorServidor && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Aviso del Sistema</p>
                    <p>{errorServidor}</p>
                  </div>
                </div>
              )}

              {/* Bloqueo por Pedidos Pendientes (RV-122, RN-110, MSG-174) */}
              {tienePedidosPendientes && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-900">
                        No se puede cerrar la caja: hay pedidos pendientes de cobro.
                      </h3>
                      <p className="text-xs text-red-700 mt-0.5">
                        Debe cobrarlos o anularlos previamente para no dejar cuentas abiertas antes del arqueo.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-red-200 bg-surface rounded-xl border border-red-200 overflow-hidden max-h-48 overflow-y-auto">
                    {resumen?.pedidosPendientes.map((p) => (
                      <div key={p.pedidoId} className="p-3 flex items-center justify-between text-xs gap-3">
                        <div>
                          <span className="font-bold text-ink">Pedido #{p.numero}</span>
                          <span className="text-neutral-500 ml-2">
                            ({p.tipo} · {p.mesa || 'Sin mesa'})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-red-600 tabular-nums">
                            {formatCurrency(p.total)}
                          </span>
                          {onCobrarPedido && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onCobrarPedido(p.pedidoId);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-[#B94600] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                            >
                              Cobrar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarjetas de Resumen Contable (5 Métricas Clave, RV-123) */}
              {resumen && <ResumenContableCards resumen={resumen} />}

              {/* Conteo de Efectivo y Diferencia (RV-124, RV-125) */}
              <ArqueoEfectivoSection
                tienePedidosPendientes={tienePedidosPendientes}
                onAbrirContador={() => setContadorModalOpen(true)}
                inputContadoRef={inputContadoRef}
                efectivoContadoInput={efectivoContadoInput}
                onEfectivoChange={(val) => {
                  setEfectivoContadoInput(val);
                  if (errorServidor) setErrorServidor(null);
                }}
                diferenciaCalculada={diferenciaCalculada}
                contadoNumerico={contadoNumerico}
                efectivoEsperado={resumen?.efectivoEsperado}
                observacion={observacion}
                onObservacionChange={setObservacion}
              />

              {/* Desglose en 3 Bloques (D-017, RN-138, E-401): Carta, Menús Completos y Componentes */}
              {resumen && <CerrarCajaDesgloseSection resumen={resumen} />}
            </>
          )}

          {/* Diálogo Modal de Confirmación MSG-180 (RV-127 / E-306) */}
          <ConfirmarCierreModal
            isOpen={pasoConfirmacion}
            resumen={resumen}
            contadoNumerico={contadoNumerico}
            diferenciaCalculada={diferenciaCalculada}
            procesandoCierre={procesandoCierre}
            onCancel={() => setPasoConfirmacion(false)}
            onConfirm={handleConfirmarCierre}
            confirmDialogRef={confirmDialogRef}
            cancelBtnRef={cancelBtnRef}
          />
        </div>

        {/* Footer principal del modal */}
        <div className="bg-neutral-50/80 border-t border-neutral-200 p-4 flex items-center justify-end gap-3">
          {resultadoCierre ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
            >
              Volver a Caja
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  cargandoResumen ||
                  tienePedidosPendientes ||
                  contadoNumerico === null ||
                  observacion.length > 200
                }
                onClick={handleAvanzarConfirmacion}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#C0392B] hover:bg-[#A93226] disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
              >
                <Lock className="w-4 h-4" />
                <span>CERRAR CAJA</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal Contador de Denominaciones */}
      <ContadorDenominacionesModal
        isOpen={contadorModalOpen}
        onClose={() => setContadorModalOpen(false)}
        onAplicarTotal={(tot) => {
          setEfectivoContadoInput(tot.toFixed(2));
          if (errorServidor) setErrorServidor(null);
        }}
      />
    </div>
  );
};

export default CerrarCajaModal;
