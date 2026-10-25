import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  X,
  RotateCcw,
  Ban,
  AlertCircle
} from 'lucide-react';
import type { VentaDetalle } from '../../types/venta';

interface AnularVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetalle | null;
  onConfirmar: (motivo: string, destinoPedido: 'porCobrar' | 'anular') => Promise<void>;
  loading: boolean;
}

const MOTIVOS_RAPIDOS = [
  'Error en método de pago',
  'Cobro duplicado',
  'Monto incorrecto',
  'Error al ingresar productos',
  'Cliente desistió del pedido'
];

export const AnularVentaModal: React.FC<AnularVentaModalProps> = ({
  isOpen,
  onClose,
  venta,
  onConfirmar,
  loading
}) => {
  const [motivo, setMotivo] = useState<string>('');
  const [destinoPedido, setDestinoPedido] = useState<'porCobrar' | 'anular'>('porCobrar');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const botonCancelarRef = useRef<HTMLButtonElement | null>(null);

  // RV-114: Foco inicial en CANCELAR al abrir el diálogo
  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setDestinoPedido('porCobrar');
      setErrorLocal(null);
      setTimeout(() => {
        botonCancelarRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Tecla Escape para cancelar (RNF-41, Nielsen 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || loading) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !venta) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const motivoTrim = motivo.trim();

    // RV-113: Motivo obligatorio de 5 a 100 caracteres
    if (motivoTrim.length < 5 || motivoTrim.length > 100) {
      setErrorLocal('Indique el motivo de la anulación (entre 5 y 100 caracteres).');
      return;
    }

    setErrorLocal(null);
    try {
      await onConfirmar(motivoTrim, destinoPedido);
    } catch {
      // El error se gestiona en el hook/toast
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-anular-venta"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl max-w-lg w-full p-6 text-neutral-800 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                ACCIÓN IRREVERSIBLE
              </p>
              <h2 id="titulo-anular-venta" className="text-xl font-sans font-bold text-ink">
                Anular Venta {venta.comprobante}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar ventana"
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con scroll si pantalla es pequeña */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Mensaje de confirmación MSG-161 */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-700 leading-relaxed">
            <p>
              ¿Anular la venta <strong>{venta.comprobante}</strong> por <strong>S/ {venta.total.toFixed(2)}</strong>?
              No se puede deshacer y quedará registrada con su motivo y usuario en auditoría.
            </p>
          </div>

          {/* Advertencia MSG-165 si caja cerrada */}
          {venta.cajaCerrada && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-accent flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Aviso de cierre de caja:</strong> La venta pertenece a una caja cerrada: se anulará y el ajuste quedará registrado en los reportes.
              </span>
            </div>
          )}

          {/* Motivos rápidos (RV-113) */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Motivos rápidos:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOTIVOS_RAPIDOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setMotivo(m);
                    setErrorLocal(null);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                    motivo === m
                      ? 'bg-primary text-white border-accent font-semibold'
                      : 'bg-surface border-neutral-200 text-neutral-700 hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Campo Motivo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="motivo-anulacion" className="text-sm font-medium text-ink">
                Motivo de anulación <span className="text-rose-600">*</span>
              </label>
              <span className={`text-xs tabular-nums ${motivo.length > 100 || (motivo.length > 0 && motivo.length < 5) ? 'text-rose-600 font-bold' : 'text-neutral-500'}`}>
                {motivo.length}/100
              </span>
            </div>
            <textarea
              id="motivo-anulacion"
              rows={3}
              value={motivo}
              disabled={loading}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (errorLocal) setErrorLocal(null);
              }}
              placeholder="Explique el motivo por el cual se anula la venta (ej. cliente canceló consumo)..."
              className={`w-full px-3 py-2 text-xs rounded-xl border bg-surface focus:outline-none focus:ring-2 transition-all ${
                errorLocal
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-neutral-200 focus:border-accent focus:ring-2 focus:ring-amber-200'
              }`}
            />
            {errorLocal && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorLocal}</span>
              </p>
            )}
          </div>

          {/* Destino del pedido (RV-115, RN-102) */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-sm font-medium text-ink mb-2">
              ¿Qué desea hacer con el pedido N.º {venta.pedidoNumero}? <span className="text-rose-600">*</span>
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  destinoPedido === 'porCobrar'
                    ? 'border-accent bg-amber-50/40 ring-1 ring-accent'
                    : 'border-neutral-200 bg-surface hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="destinoPedido"
                  value="porCobrar"
                  checked={destinoPedido === 'porCobrar'}
                  disabled={loading}
                  onChange={() => setDestinoPedido('porCobrar')}
                  className="mt-0.5 text-accent focus:ring-accent"
                />
                <div className="text-xs">
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-accent" />
                    Dejar el pedido por cobrar (Recomendado)
                  </span>
                  <p className="text-neutral-500 mt-0.5 leading-normal">
                    El pedido reaparece en <strong>Gestión de Caja</strong> para ser cobrado de nuevo con el método o importe correcto y un nuevo número de comprobante. La mesa permanece ocupada.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  destinoPedido === 'anular'
                    ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-neutral-200 bg-surface hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="destinoPedido"
                  value="anular"
                  checked={destinoPedido === 'anular'}
                  disabled={loading}
                  onChange={() => setDestinoPedido('anular')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-rose-600" />
                    Anular también el pedido
                  </span>
                  <p className="text-neutral-500 mt-0.5 leading-normal">
                    El pedido queda cancelado permanentemente en el sistema. Si era el único pedido activo de su mesa, la mesa se libera automáticamente.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Botones de acción (RV-114, RV-116) */}
          <div className="pt-3 border-t border-neutral-200/80 flex items-center justify-end gap-2 shrink-0">
            {/* CANCELAR con foco inicial */}
            <button
              ref={botonCancelarRef}
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || motivo.trim().length < 5 || motivo.trim().length > 100}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                loading || motivo.trim().length < 5 || motivo.trim().length > 100
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
                  : 'bg-rose-600 hover:bg-rose-700 cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Anulando…</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span>Anular venta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

