import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Coins, Banknote, RotateCcw, Check, X } from 'lucide-react';

export interface ContadorDenominacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAplicarTotal: (total: number) => void;
}

interface DenominacionDef {
  id: string;
  valor: number;
  etiqueta: string;
  tipo: 'billete' | 'moneda';
}

const DENOMINACIONES: DenominacionDef[] = [
  // Billetes
  { id: 'b200', valor: 200, etiqueta: 'S/ 200', tipo: 'billete' },
  { id: 'b100', valor: 100, etiqueta: 'S/ 100', tipo: 'billete' },
  { id: 'b50', valor: 50, etiqueta: 'S/ 50', tipo: 'billete' },
  { id: 'b20', valor: 20, etiqueta: 'S/ 20', tipo: 'billete' },
  { id: 'b10', valor: 10, etiqueta: 'S/ 10', tipo: 'billete' },
  // Monedas
  { id: 'm5', valor: 5, etiqueta: 'S/ 5.00', tipo: 'moneda' },
  { id: 'm2', valor: 2, etiqueta: 'S/ 2.00', tipo: 'moneda' },
  { id: 'm1', valor: 1, etiqueta: 'S/ 1.00', tipo: 'moneda' },
  { id: 'm050', valor: 0.50, etiqueta: 'S/ 0.50', tipo: 'moneda' },
  { id: 'm020', valor: 0.20, etiqueta: 'S/ 0.20', tipo: 'moneda' },
  { id: 'm010', valor: 0.10, etiqueta: 'S/ 0.10', tipo: 'moneda' },
];

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
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-[#FFFDF9] border border-[#E6D7C3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-[#482813] to-[#5C341A] px-6 py-4 flex items-center justify-between text-white border-b border-[#3D2110]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D35400] flex items-center justify-center text-white shadow-md">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#F39C12]">
                Herramienta de Arqueo
              </p>
              <h2 id="contador-title" className="font-brand-serif text-lg font-bold">
                Contador de Billetes y Monedas
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#482813]">
          <p className="text-sm text-stone-600">
            Ingrese la cantidad de unidades por cada denominación peruana. El total se suma en tiempo real y no se guarda el desglose individual (RV-128).
          </p>

          {/* Sección Billetes */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-stone-200">
              <Banknote className="w-4 h-4 text-[#D35400]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                Billetes (S/)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {billetes.map((b) => {
                const cant = cantidades[b.id] ?? '';
                const cantNum = typeof cant === 'number' ? cant : 0;
                const subtotal = cantNum > 0 ? (cantNum * Math.round(b.valor * 100)) / 100 : 0;
                const err = errores[b.id];

                return (
                  <div
                    key={b.id}
                    className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl flex items-center justify-between gap-3 focus-within:border-[#D35400] transition-colors"
                  >
                    <div className="w-20">
                      <span className="font-bold text-sm text-[#482813]">{b.etiqueta}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">Cant:</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="999"
                          step="1"
                          value={cant}
                          onChange={(e) => handleCantidadChange(b.id, e.target.value)}
                          placeholder="0"
                          className={`w-20 text-right px-2 py-1 bg-white border rounded-lg text-sm font-semibold tabular-nums focus:outline-hidden focus:ring-1 ${
                            err
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-stone-300 focus:ring-[#D35400]'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-stone-500 tabular-nums mt-0.5">
                        = S/ {subtotal.toFixed(2)}
                      </span>
                      {err && <span className="text-[10px] text-red-600 mt-0.5">{err}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sección Monedas */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-stone-200">
              <Coins className="w-4 h-4 text-[#D35400]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                Monedas (S/)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {monedas.map((m) => {
                const cant = cantidades[m.id] ?? '';
                const cantNum = typeof cant === 'number' ? cant : 0;
                const subtotal = cantNum > 0 ? (cantNum * Math.round(m.valor * 100)) / 100 : 0;
                const err = errores[m.id];

                return (
                  <div
                    key={m.id}
                    className="p-3 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl flex items-center justify-between gap-3 focus-within:border-[#D35400] transition-colors"
                  >
                    <div className="w-20">
                      <span className="font-bold text-sm text-[#482813]">{m.etiqueta}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">Cant:</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="999"
                          step="1"
                          value={cant}
                          onChange={(e) => handleCantidadChange(m.id, e.target.value)}
                          placeholder="0"
                          className={`w-20 text-right px-2 py-1 bg-white border rounded-lg text-sm font-semibold tabular-nums focus:outline-hidden focus:ring-1 ${
                            err
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-stone-300 focus:ring-[#D35400]'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-stone-500 tabular-nums mt-0.5">
                        = S/ {subtotal.toFixed(2)}
                      </span>
                      {err && <span className="text-[10px] text-red-600 mt-0.5">{err}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Barra de Total y Acciones */}
        <div className="bg-[#F5EBE1] border-t border-[#E6D7C3] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={handleLimpiar}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
            <div className="text-right sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Total Contado
              </span>
              <span className="font-brand-serif text-2xl font-black text-[#482813] tabular-nums">
                S/ {totalCalculado.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={hayErrores}
              onClick={handleConfirmar}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#D35400] hover:bg-[#B94600] disabled:bg-stone-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
            >
              <Check className="w-4 h-4" />
              USAR ESTE TOTAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContadorDenominacionesModal;
