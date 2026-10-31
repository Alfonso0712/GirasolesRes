import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import { cajaService } from '../../services/cajaService';
import { formatCurrency } from '../../utils/formatters';
import { AbrirCajaFormStep, AbrirCajaConfirmStep } from './abrir-caja';

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

      const msgExito = `Caja abierta con ${formatCurrency(monto)}.`; // MSG-173 tabular-nums
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-surface border border-neutral-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent flex items-center justify-center border border-amber-200/80 shadow-xs">
              <SolesIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                Gestión de Caja
              </p>
              <h2 id="abrir-caja-title" className="font-sans text-xl font-bold text-ink tracking-tight">
                Apertura de Caja
              </h2>
            </div>
          </div>
          {!procesando && (
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-6 text-ink">
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
            <AbrirCajaFormStep
              inputRef={inputRef}
              montoInput={montoInput}
              onMontoInputChange={setMontoInput}
              errorValidacion={errorValidacion}
              onErrorValidacionClear={() => setErrorValidacion(null)}
              sugerenciaInicial={sugerenciaInicial}
              onSubmit={handleAvanzarConfirmacion}
              onClose={onClose}
            />
          ) : (
            <AbrirCajaConfirmStep
              cancelBtnRef={cancelBtnRef}
              montoNumerico={montoNumerico}
              procesando={procesando}
              onVolver={() => setPasoConfirmacion(false)}
              onConfirmar={handleConfirmarApertura}
            />
          )}
        </div>
      </div>
    </div>
  );
};
