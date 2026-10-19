import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, AlertCircle, HelpCircle, Check, X, ShieldAlert } from 'lucide-react';
import { cajaService } from '../../services/cajaService';

export interface AbrirCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCajaAbierta: (monto: number, mensaje: string) => void;
  token: string;
  sugerenciaInicial?: number | null;
}

export const AbrirCajaModal: React.FC<AbrirCajaModalProps> = ({
  isOpen,
  onClose,
  onCajaAbierta,
  token,
  sugerenciaInicial = null,
}) => {
  const [montoInput, setMontoInput] = useState<string>('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [pasoConfirmacion, setPasoConfirmacion] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // E-288: Precargar sugerencia automáticamente al abrir
  useEffect(() => {
    if (isOpen) {
      if (sugerenciaInicial !== null && sugerenciaInicial !== undefined && sugerenciaInicial >= 0) {
        setMontoInput(sugerenciaInicial.toFixed(2));
      } else {
        setMontoInput('');
      }
      setErrorValidacion(null);
      setErrorServidor(null);
      setPasoConfirmacion(false);
      setProcesando(false);

      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, sugerenciaInicial]);

  // RV-127 / RV-114: Foco inicial en CANCELAR al entrar al paso de confirmación
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
      if (e.key === 'Escape' && !procesando) {
        e.preventDefault();
        if (pasoConfirmacion) {
          setPasoConfirmacion(false);
        } else {
          onClose();
        }
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
  }, [isOpen, pasoConfirmacion, procesando, onClose]);

  if (!isOpen) return null;

  const validarMonto = (): number | null => {
    const raw = montoInput.trim();
    if (!raw) {
      setErrorValidacion('Ingrese el monto inicial.'); // MSG-169
      return null;
    }

    // Acepta coma o punto como separador decimal
    const normalizado = raw.replace(',', '.');
    const parsed = parseFloat(normalizado);

    if (isNaN(parsed) || parsed < 0) {
      setErrorValidacion('Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.'); // MSG-170 tabular-nums
      return null;
    }

    // Validar hasta 2 decimales
    const partes = normalizado.split('.');
    if (partes.length === 2 && partes[1].length > 2) {
      setErrorValidacion('Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.'); // MSG-170 tabular-nums
      return null;
    }

    // RV-120: Límite superior S/ 99,999.99
    if (parsed > 99999.99) {
      setErrorValidacion('El monto no puede superar S/ 99,999.99.'); // MSG-171 tabular-nums
      return null;
    }

    setErrorValidacion(null);
    return Math.round(parsed * 100) / 100;
  };

  const handleAvanzarConfirmacion = (e: React.FormEvent) => {
    e.preventDefault();
    const val = validarMonto();
    if (val !== null) {
      setPasoConfirmacion(true);
    }
  };

  const handleConfirmarApertura = async () => {
    if (procesando) return; // Guard contra doble clic rápido (E-292, RV-121)

    const monto = validarMonto();
    if (monto === null) {
      setPasoConfirmacion(false);
      return;
    }

    setProcesando(true);
    setErrorServidor(null);

    try {
      const solicitudId = crypto.randomUUID(); // Idempotencia RV-121
      const res = await cajaService.abrirCaja(
        {
          solicitudId,
          montoInicial: monto,
        },
        token
      );

      const msgExito = `Caja abierta con S/ ${monto.toFixed(2)}.`; // MSG-173 tabular-nums
      onCajaAbierta(monto, res.mensaje || msgExito);
      onClose();
    } catch (err: any) {
      setErrorServidor(err.message || 'No se pudo abrir la caja. No se registró la apertura; intente nuevamente.'); // MSG-182
      setPasoConfirmacion(false);
    } finally {
      setProcesando(false);
    }
  };

  const montoNumerico = parseFloat(montoInput.replace(',', '.')) || 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="abrir-caja-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-[#FFFDF9] border border-[#E6D7C3] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-[#482813] to-[#5C341A] px-6 py-4 flex items-center justify-between text-white border-b border-[#3D2110]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D35400] flex items-center justify-center text-white shadow-md">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#F39C12]">
                GESTIÓN DE CAJA
              </p>
              <h2 id="abrir-caja-title" className="font-sans text-xl font-bold text-white">
                Apertura de Caja
              </h2>
            </div>
          </div>
          {!procesando && (
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-6 text-[#482813]">
          {errorServidor && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error al abrir la caja</p>
                <p>{errorServidor}</p>
              </div>
            </div>
          )}

          {!pasoConfirmacion ? (
            /* Paso 1: Ingreso de monto inicial */
            <form onSubmit={handleAvanzarConfirmacion} className="space-y-4">
              <p className="text-sm text-stone-600">
                Ingrese el sencillo o fondo inicial en efectivo con el que iniciará el turno para habilitar el cobro de pedidos.
              </p>

              {sugerenciaInicial !== null && sugerenciaInicial !== undefined && sugerenciaInicial >= 0 && (
                <div className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <HelpCircle className="w-4 h-4 text-[#D35400] shrink-0" />
                    <span>Sugerido del último cierre:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMontoInput(sugerenciaInicial.toFixed(2));
                      setErrorValidacion(null);
                    }}
                    className="font-bold text-[#D35400] hover:underline cursor-pointer tabular-nums"
                  >
                    <span className="tabular-nums">S/ {sugerenciaInicial.toFixed(2)}</span> (Usar)
                  </button>
                </div>
              )}

              <div>
                <label htmlFor="monto-inicial" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Monto Inicial (S/) <span className="text-red-600">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold">
                    S/
                  </div>
                  <input
                    ref={inputRef}
                    id="monto-inicial"
                    type="number"
                    step="0.01"
                    min="0"
                    max="99999.99"
                    value={montoInput}
                    onChange={(e) => {
                      setMontoInput(e.target.value);
                      if (errorValidacion) setErrorValidacion(null);
                    }}
                    placeholder="0.00"
                    className={`block w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-lg font-bold tabular-nums text-[#482813] focus:outline-hidden focus:ring-2 ${
                      errorValidacion
                        ? 'border-red-500 focus:ring-red-500 bg-red-50/50'
                        : 'border-[#E6D7C3] focus:border-[#D35400] focus:ring-[#D35400]/20'
                    }`}
                  />
                </div>
                {errorValidacion && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorValidacion}
                  </p>
                )}
                <p className="text-[11px] text-stone-500 mt-1">
                  Permitido: S/ 0.00 a S/ 99,999.99 con hasta 2 decimales.
                </p>
              </div>

              {/* Botones de montos sugeridos rápidos */}
              <div className="flex gap-2 pt-1">
                {[0, 50, 100, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setMontoInput(val.toFixed(2));
                      setErrorValidacion(null);
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold font-sans tabular-nums rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                  >
                    S/ {val}
                  </button>
                ))}
              </div>

              {/* Botones Footer */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#D35400] hover:bg-[#B94600] rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
                >
                  Continuar
                </button>
              </div>
            </form>
          ) : (
            /* Paso 2: Diálogo de Confirmación MSG-172 con Foco Inicial en Cancelar (RV-127) */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-amber-900">Confirmación de Apertura</p>
                  <p className="text-amber-800 mt-1">
                    ¿Abrir la caja con <strong className="font-extrabold text-[#482813] tabular-nums">S/ {montoNumerico.toFixed(2)}</strong>? Podrá empezar a registrar cobros.
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-500">
                Al confirmar, se habilitará inmediatamente el cobro de pedidos en el salón y pedidos para llevar.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  ref={cancelBtnRef}
                  type="button"
                  disabled={procesando}
                  onClick={() => setPasoConfirmacion(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 disabled:opacity-50 transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesando}
                  onClick={handleConfirmarApertura}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#2E7D32] hover:bg-[#256628] disabled:bg-stone-400 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
                >
                  {procesando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Abriendo...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>CONFIRMAR APERTURA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
