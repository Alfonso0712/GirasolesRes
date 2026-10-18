import React, { useState } from 'react';
import { DollarSign, X, AlertCircle } from 'lucide-react';

interface AbrirCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (montoApertura: number) => Promise<void>;
  loading?: boolean;
}

export const AbrirCajaModal: React.FC<AbrirCajaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [monto, setMonto] = useState<string>('0.00');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    const parsed = parseFloat(monto);
    if (isNaN(parsed) || parsed < 0) {
      setErrorLocal('El monto inicial debe ser un número mayor o igual a 0.00');
      return;
    }

    if (parsed > 9999.99) {
      setErrorLocal('El monto inicial no puede superar S/ 9,999.99');
      return;
    }

    try {
      await onConfirm(parsed);
      onClose();
    } catch (err: any) {
      setErrorLocal(err.message || 'No se pudo abrir la caja.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-abrir-caja-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D35400] flex items-center justify-center border border-amber-200/60">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="modal-abrir-caja-title"
                className="text-lg font-serif font-bold text-[#2C1A0E] tracking-tight"
              >
                Apertura de Caja
              </h2>
              <p className="text-xs text-neutral-500">
                Inicie el turno operativo para habilitar el cobro de pedidos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorLocal && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorLocal}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="monto-inicial-input"
              className="block text-xs font-bold text-[#2C1A0E] uppercase tracking-wider mb-1.5"
            >
              Fondo inicial en efectivo (S/)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                S/
              </span>
              <input
                id="monto-inicial-input"
                type="number"
                step="0.10"
                min="0"
                max="9999.99"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                autoFocus
                disabled={loading}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 text-neutral-900 text-base font-semibold font-mono"
                placeholder="0.00"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Ingrese el monto en monedas y billetes con el que arranca la caja (puede ser 0.00).
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            {[0, 50, 100, 200].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMonto(val.toFixed(2))}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors"
              >
                S/ {val}
              </button>
            ))}
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-[#B84600] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Una vez abierta la caja, todos los cobros y emisiones de comprobante quedarán asociados a este turno.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              {loading ? (
                <span>Abriendo caja...</span>
              ) : (
                <span>Confirmar Apertura</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
