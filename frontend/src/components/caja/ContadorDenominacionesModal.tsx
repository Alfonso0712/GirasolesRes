import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Coins, Banknote, X } from 'lucide-react';
import {
  DENOMINACIONES,
  DenominacionRow,
  ContadorFooterBar
} from './contador';

export interface ContadorDenominacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAplicarTotal: (total: number) => void;
}

export const ContadorDenominacionesModal: React.FC<ContadorDenominacionesModalProps> = ({
  isOpen,
  onClose,
  onAplicarTotal,
}) => {
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Foco inicial en el primer campo de conteo al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Focus trap y tecla Escape global
  useEffect(() => {
    if (!isOpen) return;

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

  const handleCantidadChange = (id: string, rawVal: string) => {
    const trimmed = rawVal.trim();
    if (trimmed === '') {
      setCantidades((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setErrores((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    const isStrictInteger = /^\d+$/.test(trimmed);
    const parsed = parseInt(trimmed, 10);
    if (!isStrictInteger || isNaN(parsed) || parsed < 0 || parsed > 999) {
      setErrores((prev) => ({
        ...prev,
        [id]: 'La cantidad debe ser un número entero entre 0 y 999.', // MSG-184
      }));
      setCantidades((prev) => ({ ...prev, [id]: isNaN(parsed) ? 0 : parsed }));
    } else {
      setErrores((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setCantidades((prev) => ({ ...prev, [id]: parsed }));
    }
  };

  const handleLimpiar = () => {
    setCantidades({});
    setErrores({});
  };

  // Suma acumulada en centavos para prevenir error de coma flotante IEEE-754
  const totalCalculado = useMemo(() => {
    const totalCentavos = DENOMINACIONES.reduce((acc, denom) => {
      const cant = cantidades[denom.id] || 0;
      const tieneError = Boolean(errores[denom.id]);
      if (tieneError || cant <= 0 || cant > 999) return acc;
      const centavosDenom = Math.round(denom.valor * 100);
      return acc + cant * centavosDenom;
    }, 0);
    return totalCentavos / 100;
  }, [cantidades, errores]);

  const hayErrores = useMemo(() => Object.keys(errores).length > 0, [errores]);

  const handleConfirmar = () => {
    if (hayErrores) return;
    onAplicarTotal(Math.round(totalCalculado * 100) / 100);
    onClose();
  };

  if (!isOpen) return null;

  const billetes = DENOMINACIONES.filter((d) => d.tipo === 'billete');
  const monedas = DENOMINACIONES.filter((d) => d.tipo === 'moneda');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contador-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-surface border border-neutral-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent border border-amber-200/80 flex items-center justify-center shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                Herramienta de Arqueo
              </p>
              <h2 id="contador-title" className="font-sans text-xl font-bold text-ink tracking-tight">
                Contador de Billetes y Monedas
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-ink">
          <p className="text-sm text-neutral-600">
            Ingrese la cantidad de unidades por cada denominación. El total se suma en tiempo real y no se guarda el desglose individual.
          </p>

          {/* Sección Billetes */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-neutral-200">
              <Banknote className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700">
                Billetes (S/)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {billetes.map((b, idx) => (
                <DenominacionRow
                  key={b.id}
                  denom={b}
                  cantidad={cantidades[b.id] ?? ''}
                  error={errores[b.id]}
                  onChange={handleCantidadChange}
                  inputRef={idx === 0 ? firstInputRef : undefined}
                />
              ))}
            </div>
          </div>

          {/* Sección Monedas */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-neutral-200">
              <Coins className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700">
                Monedas (S/)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {monedas.map((m) => (
                <DenominacionRow
                  key={m.id}
                  denom={m}
                  cantidad={cantidades[m.id] ?? ''}
                  error={errores[m.id]}
                  onChange={handleCantidadChange}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Barra de Total y Acciones */}
        <ContadorFooterBar
          totalCalculado={totalCalculado}
          hayErrores={hayErrores}
          onLimpiar={handleLimpiar}
          onClose={onClose}
          onConfirmar={handleConfirmar}
        />
      </div>
    </div>
  );
};

export default ContadorDenominacionesModal;
