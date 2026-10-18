import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Lock,
  Coins,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  Utensils,
  X,
  CreditCard,
  Banknote,
  DollarSign,
} from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import { ContadorDenominacionesModal } from './ContadorDenominacionesModal';
import type { CierreResumenDto, CerrarCajaResponseDto } from '../../types/caja';

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
  }, [isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-[#FFFDF9] border border-[#E6D7C3] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-[#482813] to-[#5C341A] px-6 py-4 flex items-center justify-between text-white border-b border-[#3D2110]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C0392B] flex items-center justify-center text-white shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#F39C12]">
                CUS 13.2 · Vista 13.2
              </p>
              <h2 id="cerrar-caja-title" className="font-brand-serif text-lg font-bold">
                Cierre de Caja y Cuadre de Turno
              </h2>
            </div>
          </div>
          {!procesandoCierre && (
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#482813]">
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
                <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Monto Inicial
                  </p>
                  <p className="text-base font-bold text-[#482813] tabular-nums mt-0.5">
                    S/ {resultadoCierre.montoInicial.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Efectivo Esperado
                  </p>
                  <p className="text-base font-bold text-[#482813] tabular-nums mt-0.5">
                    S/ {resultadoCierre.efectivoEsperado.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Efectivo Contado
                  </p>
                  <p className="text-base font-bold text-[#482813] tabular-nums mt-0.5">
                    S/ {resultadoCierre.efectivoContado.toFixed(2)}
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
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Diferencia
                  </p>
                  <p className="text-base font-black tabular-nums mt-0.5">
                    {resultadoCierre.diferencia === 0
                      ? 'Cuadra'
                      : <span className="tabular-nums">{`${resultadoCierre.diferencia > 0 ? '+' : ''}S/ ${resultadoCierre.diferencia.toFixed(2)}`}</span>}
                  </p>
                </div>
              </div>

              {/* Botones de Entregable */}
              <div className="p-4 bg-[#F5EBE1] border border-[#E6D7C3] rounded-xl flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-stone-600 font-semibold">
                  Descargue o imprima el voucher de balance para el registro físico del restaurante (reemplaza el cuaderno).
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDescargarPdf}
                    disabled={descargandoPdf}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#D35400] hover:bg-[#B94600] disabled:bg-stone-400 disabled:cursor-not-allowed rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    {descargandoPdf ? 'DESCARGANDO...' : 'DESCARGAR PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          ) : cargandoResumen ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-500">
              <div className="w-8 h-8 border-3 border-[#D35400] border-t-transparent rounded-full animate-spin" />
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

                  <div className="divide-y divide-red-200 bg-white rounded-xl border border-red-200 overflow-hidden max-h-48 overflow-y-auto">
                    {resumen?.pedidosPendientes.map((p) => (
                      <div key={p.pedidoId} className="p-3 flex items-center justify-between text-xs gap-3">
                        <div>
                          <span className="font-bold text-[#482813]">Pedido #{p.numero}</span>
                          <span className="text-stone-500 ml-2">
                            ({p.tipo} · {p.mesa || 'Sin mesa'})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-red-600 tabular-nums">
                            S/ {p.total.toFixed(2)}
                          </span>
                          {onCobrarPedido && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onCobrarPedido(p.pedidoId);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#D35400] hover:bg-[#B94600] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer min-h-[44px]"
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
              {resumen && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-600">
                      Resumen de Ventas Vigentes del Turno
                    </h3>
                    <span className="text-xs text-stone-500">
                      Total ventas registradas: <strong>{resumen.cantidadVentas}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Monto Inicial
                      </span>
                      <span className="text-base font-bold text-[#482813] tabular-nums mt-0.5 block">
                        S/ {resumen.montoInicial.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-stone-400 block">Fondo turno</span>
                    </div>

                    <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block flex items-center gap-1">
                        <Banknote className="w-3 h-3 text-[#D35400]" /> Ventas Efectivo
                      </span>
                      <span className="text-base font-bold text-[#482813] tabular-nums mt-0.5 block">
                        S/ {resumen.ventasEfectivo.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-stone-400 block">Gaveta física</span>
                    </div>

                    <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-purple-600" /> Ventas Yape / QR
                      </span>
                      <span className="text-base font-bold text-purple-900 tabular-nums mt-0.5 block">
                        S/ {resumen.ventasYape.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-stone-400 block">Cuenta digital</span>
                    </div>

                    <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" /> Total Ventas
                      </span>
                      <span className="text-base font-bold text-emerald-900 tabular-nums mt-0.5 block">
                        S/ {resumen.totalVentas.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-stone-400 block">Efectivo + Yape</span>
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                        Efectivo Esperado
                      </span>
                      <span className="text-lg font-black text-[#D35400] tabular-nums mt-0.5 block">
                        S/ {resumen.efectivoEsperado.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-stone-500 block">
                        (Inicial + Efectivo)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conteo de Efectivo y Diferencia (RV-124, RV-125) */}
              <div className="p-4 bg-[#FAF6F0] border border-[#E6D7C3] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label
                      htmlFor="efectivo-contado"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                    >
                      Efectivo Contado en Gaveta (S/) <span className="text-red-600">*</span>
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Cuente el dinero físico o use el contador de billetes y monedas.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={tienePedidosPendientes}
                    onClick={() => setContadorModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#5C341A] hover:bg-[#482813] disabled:bg-stone-300 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
                  >
                    <Coins className="w-4 h-4 text-[#F39C12]" />
                    CONTAR BILLETES Y MONEDAS
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold">
                    S/
                  </div>
                  <input
                    ref={inputContadoRef}
                    id="efectivo-contado"
                    type="number"
                    step="0.01"
                    min="0"
                    max="99999.99"
                    disabled={tienePedidosPendientes}
                    value={efectivoContadoInput}
                    onChange={(e) => {
                      setEfectivoContadoInput(e.target.value);
                      if (errorServidor) setErrorServidor(null);
                    }}
                    placeholder="0.00"
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-[#E6D7C3] rounded-xl text-xl font-bold tabular-nums text-[#482813] focus:outline-hidden focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Indicador de Diferencia (RV-125, MSG-176, MSG-177, MSG-178) */}
                {diferenciaCalculada !== null && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                      diferenciaCalculada === 0
                        ? 'bg-green-50 border-green-300 text-green-900'
                        : diferenciaCalculada > 0
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-red-50 border-red-300 text-red-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {diferenciaCalculada === 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <AlertTriangle
                          className={`w-5 h-5 shrink-0 ${
                            diferenciaCalculada > 0 ? 'text-amber-600' : 'text-red-600'
                          }`}
                        />
                      )}
                      <div>
                        <p className="font-bold text-sm">
                          {diferenciaCalculada === 0 ? (
                            'Cuadra: el efectivo contado coincide con el esperado.' // MSG-176
                          ) : diferenciaCalculada > 0 ? (
                            <span className="tabular-nums">{`Sobrante de S/ ${diferenciaCalculada.toFixed(2)}. Se recomienda indicar una observación.`}</span> // MSG-177
                          ) : (
                            <span className="tabular-nums">{`Faltante de S/ ${Math.abs(diferenciaCalculada).toFixed(2)}. Se recomienda indicar una observación.`}</span> // MSG-178
                          )}
                        </p>
                        <p className="text-[11px] opacity-80 tabular-nums">
                          Esperado: <span className="tabular-nums">S/ {resumen?.efectivoEsperado.toFixed(2)}</span> | Contado: <span className="tabular-nums">S/ {contadoNumerico?.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-lg tabular-nums shrink-0">
                      {diferenciaCalculada === 0
                        ? 'Cuadra'
                        : `${diferenciaCalculada > 0 ? '+' : '-'}S/ ${Math.abs(
                            diferenciaCalculada
                          ).toFixed(2)}`}
                    </span>
                  </div>
                )}

                {/* Observación Opcional (RV-126) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="observacion-cierre"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                    >
                      Observación {diferenciaCalculada !== null && diferenciaCalculada !== 0 && '(Recomendada)'}
                    </label>
                    <span
                      className={`text-[10px] tabular-nums font-semibold ${
                        observacion.length > 200 ? 'text-red-600 font-bold' : 'text-stone-400'
                      }`}
                    >
                      {observacion.length}/200
                    </span>
                  </div>
                  <textarea
                    id="observacion-cierre"
                    rows={2}
                    maxLength={250}
                    disabled={tienePedidosPendientes}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Detalles de sobrante, faltante o incidencias del turno..."
                    className="block w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#482813] focus:outline-hidden focus:ring-1 focus:ring-[#D35400] focus:border-[#D35400] disabled:bg-stone-100"
                  />
                  {observacion.length > 200 && (
                    <p className="text-[10px] text-red-600 font-bold mt-1">
                      La observación no puede superar los 200 caracteres.
                    </p>
                  )}
                </div>
              </div>

              {/* Desglose de Platos Vendidos */}
              {resumen && (resumen.platosVendidos?.length ?? 0) > 0 && (
                <div className="border border-[#E6D7C3] rounded-xl overflow-hidden bg-white">
                  <div className="bg-[#FAF6F0] px-4 py-2 border-b border-[#E6D7C3] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-[#D35400]" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#482813]">
                        Platos Vendidos en el Turno
                      </h4>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      {resumen.platosVendidos.reduce((a, b) => a + b.cantidad, 0)} unidades
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-stone-100 text-xs">
                    {resumen.platosVendidos.map((p, idx) => (
                      <div key={p.productoId || `${p.nombre}-${idx}`} className="px-4 py-2 flex items-center justify-between">
                        <span className="text-stone-700 font-medium">
                          {p.cantidad}x {p.nombre}
                        </span>
                        <span className="font-semibold text-stone-600 tabular-nums">
                          S/ {p.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Diálogo Modal de Confirmación MSG-180 (RV-127 / E-306) */}
          {pasoConfirmacion && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
              <div
                ref={confirmDialogRef}
                className="bg-[#FFFDF9] border border-[#E6D7C3] rounded-2xl shadow-2xl max-w-md w-full p-6 text-[#482813] space-y-4 animate-in zoom-in-95 duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-brand-serif text-base font-bold text-red-950">
                      ¿Confirmar Cierre de Caja?
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      ¿Cerrar la caja? No podrá cobrar hasta abrir una nueva y el cierre no se puede deshacer.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl text-xs space-y-1.5 tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Efectivo esperado:</span>
                    <span className="font-bold tabular-nums">S/ {resumen?.efectivoEsperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Efectivo contado:</span>
                    <span className="font-bold tabular-nums">S/ {contadoNumerico?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-200">
                    <span className="font-bold">Diferencia:</span>
                    <span
                      className={`font-black tabular-nums ${
                        diferenciaCalculada === 0
                          ? 'text-green-700'
                          : diferenciaCalculada! > 0
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {diferenciaCalculada === 0
                        ? 'Cuadra'
                        : <span className="tabular-nums">{`${diferenciaCalculada! > 0 ? '+' : ''}S/ ${diferenciaCalculada?.toFixed(2)}`}</span>}
                    </span>
                  </div>
                </div>

                {/* Botones con Foco inicial en CANCELAR (RV-127 / E-306) */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    ref={cancelBtnRef}
                    type="button"
                    disabled={procesandoCierre}
                    onClick={() => setPasoConfirmacion(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={procesandoCierre}
                    onClick={handleConfirmarCierre}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#C0392B] hover:bg-[#962D22] disabled:bg-stone-400 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
                  >
                    {procesandoCierre ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Cerrando...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>CONFIRMAR CIERRE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer principal del modal */}
        <div className="bg-[#F5EBE1] border-t border-[#E6D7C3] p-4 flex items-center justify-end gap-3">
          {resultadoCierre ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#482813] hover:bg-[#341C0C] rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
            >
              Volver a Caja
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#C0392B] hover:bg-[#A93226] disabled:bg-stone-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
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
