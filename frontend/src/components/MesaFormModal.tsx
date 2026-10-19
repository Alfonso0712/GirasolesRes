import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { MesaItem } from '../types/mesa';
import { normalizeText } from '../utils/normalizeText';

interface MesaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mesaAEditar?: MesaItem | null;
  todasLasMesas?: MesaItem[];
  onSave: (nombre: string) => Promise<void>;
}

// Canonicalización para RV-52 (sin tildes, sin mayúsculas, sin espacios extras)
function canonicalizar(texto: string): string {
  return texto
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export const MesaFormModal: React.FC<MesaFormModalProps> = ({
  isOpen,
  onClose,
  mesaAEditar,
  todasLasMesas = [],
  onSave
}) => {
  const isEdit = !!mesaAEditar;

  const [nombre, setNombre] = useState('');
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializar estado y foco al abrir (RV-54)
  useEffect(() => {
    if (isOpen) {
      setNombre(mesaAEditar?.nombre || '');
      setErrorNombre(null);
      setGuardando(false);

      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mesaAEditar]);

  // Cierre con Escape y trampa de foco (Shneiderman 2 / Nielsen 3)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // RV-53: Limpieza automática de espacios en blur
  const handleBlurNombre = () => {
    const limpio = normalizeText(nombre);
    setNombre(limpio);
    if (errorNombre) validarNombre(limpio);
  };

  const validarNombre = (valor: string): boolean => {
    const limpio = normalizeText(valor);

    // RV-51: Obligatorio
    if (!limpio) {
      setErrorNombre('Ingrese el número o nombre de la mesa.'); // MSG-81
      return false;
    }

    // RV-51: Longitud 1 a 20 caracteres y permitidos (letras, números, espacios, tildes, guion y punto)
    if (limpio.length < 1 || limpio.length > 20) {
      setErrorNombre('El nombre de la mesa debe tener entre 1 y 20 caracteres.'); // MSG-82
      return false;
    }

    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-.]+$/;
    if (!regex.test(limpio)) {
      setErrorNombre('El nombre de la mesa debe tener entre 1 y 20 caracteres.'); // MSG-82
      return false;
    }

    // RV-52: Unicidad sin distinguir mayúsculas, tildes ni espacios extras
    const canonNuevo = canonicalizar(limpio);
    const duplicada = todasLasMesas.some((m) => {
      if (isEdit && m.id === mesaAEditar?.id) return false;
      return canonicalizar(m.nombre) === canonNuevo;
    });

    if (duplicada) {
      setErrorNombre('Esa mesa ya está registrada. Use otro número o nombre.'); // MSG-83
      return false;
    }

    setErrorNombre(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = normalizeText(nombre);
    setNombre(limpio);

    if (!validarNombre(limpio)) {
      inputRef.current?.focus();
      return;
    }

    setGuardando(true);
    try {
      await onSave(limpio);
    } catch (err: any) {
      setGuardando(false);
      // RV-54: Si el servidor detecta nombre duplicado (MSG-83) o inválido
      const msg = err?.message || 'No se pudo completar la operación. Intente nuevamente.';
      setErrorNombre(msg);
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-mesa-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-md w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado fijo (shrink-0) */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 id="modal-mesa-title" className="font-sans font-bold text-xl text-[#2C1A0E]">
              {isEdit ? 'Editar Mesa' : 'Nueva Mesa'}
            </h2>
            <p className="text-xs text-[#7C6F66] mt-0.5">
              {isEdit
                ? 'Modifique el número o nombre identificador de la mesa'
                : 'Registre una mesa para la asignación de pedidos en salón'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario (flex-1 overflow-y-auto) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
            <div>
              <label
                htmlFor="campo-nombre-mesa"
                className="block text-xs font-semibold text-[#2C1A0E] mb-1.5"
              >
                Número o nombre de la mesa <span className="text-[#D35400]">*</span>
              </label>

              <input
                id="campo-nombre-mesa"
                ref={inputRef}
                type="text"
                maxLength={20}
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errorNombre) setErrorNombre(null);
                }}
                onBlur={handleBlurNombre}
                placeholder='Ej. "1", "Mesa 5" o "Patio 2"'
                disabled={guardando}
                aria-invalid={!!errorNombre}
                aria-describedby={errorNombre ? 'error-nombre-mesa' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-all outline-none ${
                  errorNombre
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-200'
                    : 'border-neutral-200 focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 text-[#2C1A0E]'
                } ${guardando ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : ''}`}
              />

              {/* RV-54: Error visible junto al campo */}
              {errorNombre ? (
                <p
                  id="error-nombre-mesa"
                  className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium animate-in fade-in duration-150"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorNombre}</span>
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-[#7C6F66]">
                  De 1 a 20 caracteres (letras, números, espacios, tildes, guion y punto).
                </p>
              )}
            </div>

            {/* Aviso informativo de estado inicial (RN-42) */}
            {!isEdit && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                <span className="font-bold text-amber-700">Nota:</span>
                <span>Toda mesa nueva se registra automáticamente en estado <strong>Activa</strong> y <strong>Libre</strong>.</span>
              </div>
            )}
          </div>

          {/* Botones de acción al pie (shrink-0) */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-neutral-100 flex items-center justify-end gap-3 bg-neutral-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-colors cursor-pointer min-h-[40px]"
            >
              Cancelar
            </button>

            {/* RV-55: Mientras se guarda, botón deshabilitado con "Guardando…" */}
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[40px] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardando ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando…</span>
                </>
              ) : (
                <span>{isEdit ? 'Guardar cambios' : 'Guardar mesa'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
