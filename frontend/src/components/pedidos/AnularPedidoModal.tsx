import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { PedidoItemDto } from '../../types/pedido';

interface AnularPedidoModalProps {
  pedido: PedidoItemDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAnular: (pedidoId: string, motivo: string) => Promise<void>;
  loading?: boolean;
}

const MOTIVOS_RAPIDOS = [
  'Cliente se retiró',
  'Error al registrar',
  'Plato agotado'
];

export const AnularPedidoModal: React.FC<AnularPedidoModalProps> = ({
  pedido,
  isOpen,
  onClose,
  onConfirmAnular,
  loading = false
}) => {
  const [paso, setPaso] = useState<'motivo' | 'confirmacion'>('motivo');
  const [motivo, setMotivo] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const botonCancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPaso('motivo');
      setMotivo('');
      setErrorValidacion(null);
    }
  }, [isOpen]);

  // RV-77: En el paso de confirmación, colocar el foco inicial en CANCELAR
  useEffect(() => {
    if (paso === 'confirmacion' && botonCancelarRef.current) {
      botonCancelarRef.current.focus();
    }
  }, [paso]);

  if (!isOpen || !pedido) return null;

  const destino = pedido.tipo === 'Mesa'
    ? (pedido.mesa || 'Mesa')
    : `Para llevar${pedido.referencia ? ` (${pedido.referencia})` : ''}`;

  const handleSeleccionarRapido = (texto: string) => {
    setMotivo(texto);
    setErrorValidacion(null);
  };

  const handleAvanzarAConfirmacion = () => {
    const limpio = motivo.trim();
    if (limpio.length < 5 || limpio.length > 100) {
      setErrorValidacion('Indique el motivo de la anulación (entre 5 y 100 caracteres).');
      return;
    }
    setErrorValidacion(null);
    setPaso('confirmacion');
  };

  const handleConfirmar = async () => {
    await onConfirmAnular(pedido.id, motivo.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="anular-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="anular-title" className="font-sans font-bold text-xl text-ink">
                Anular pedido N.º {pedido.numero}
              </h3>
              <p className="text-xs text-neutral-500">{destino}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="modal-close-btn"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paso === 'motivo' ? (
          <div>
            <p className="text-sm text-neutral-600 mb-3">
              Seleccione un motivo rápido o escriba la razón de la anulación:
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {MOTIVOS_RAPIDOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSeleccionarRapido(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    motivo === m
                      ? 'bg-rose-50 border-rose-400 text-rose-800 font-semibold'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mb-2">
              <textarea
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                rows={3}
                maxLength={100}
                placeholder="Escriba el motivo detallado de la anulación (mínimo 5 caracteres)…"
                className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errorValidacion
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
                }`}
              />
              <div className="flex justify-between items-center text-xs text-neutral-500 mt-1 px-1">
                <span>{motivo.trim().length}/100 caracteres (mín. 5)</span>
                {errorValidacion && (
                  <span className="text-rose-600 font-medium">{errorValidacion}</span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleAvanzarAConfirmacion}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition-colors shadow-sm cursor-pointer min-h-[44px]"
              >
                Continuar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/80 mb-5 text-neutral-700 text-sm">
              <p className="font-semibold text-rose-900 mb-2">
                ¿Anular el pedido N.º {pedido.numero} ({destino})?
              </p>
              <p className="text-xs text-rose-800 leading-relaxed">
                No se podrá deshacer y quedará registrado con su motivo:
              </p>
              <p className="mt-2 text-xs tabular-nums bg-surface/80 p-2.5 rounded-lg border border-rose-200 text-neutral-800 italic">
                "{motivo.trim()}"
              </p>
            </div>

            <div className="flex gap-3">
              <button
                ref={botonCancelarRef}
                type="button"
                onClick={() => setPaso('motivo')}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-sm hover:bg-neutral-100 transition-colors cursor-pointer focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {loading ? 'Anulando…' : 'Anular pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

