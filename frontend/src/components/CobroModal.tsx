import React, { useState, useEffect } from 'react';
import { DollarSign, Smartphone, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { PedidoPendienteCobro, CobroRequest } from '../types/cobro';

interface CobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: PedidoPendienteCobro | null;
  onConfirmarCobro: (request: CobroRequest) => Promise<void>;
  loading?: boolean;
}

export const CobroModal: React.FC<CobroModalProps> = ({
  isOpen,
  onClose,
  pedido,
  onConfirmarCobro,
  loading = false,
}) => {
  const [metodo, setMetodo] = useState<'efectivo' | 'yape'>('efectivo');
  const [montoRecibidoStr, setMontoRecibidoStr] = useState<string>('');
  const [yapeConfirmado, setYapeConfirmado] = useState<boolean>(false);
  const [yapeReferencia, setYapeReferencia] = useState<string>('');
  const [solicitudId, setSolicitudId] = useState<string>('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const total = pedido ? Number(pedido.total) : 0;
  const montoRecibido = parseFloat(montoRecibidoStr);
  const vuelto = !isNaN(montoRecibido) && montoRecibido >= total ? montoRecibido - total : 0;
  const faltante = !isNaN(montoRecibido) && montoRecibido < total ? total - montoRecibido : 0;

  // Generar nuevo ID de idempotencia al abrir modal
  useEffect(() => {
    if (isOpen && pedido) {
      setMetodo('efectivo');
      setMontoRecibidoStr(total.toFixed(2));
      setYapeConfirmado(false);
      setYapeReferencia('');
      setErrorLocal(null);
      setSolicitudId(
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `cobro-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      );
    }
  }, [isOpen, pedido, total]);

  if (!isOpen || !pedido) return null;

  const handleQuickAmount = (val: number) => {
    setMontoRecibidoStr(val.toFixed(2));
  };

  const handleAddAmount = (addVal: number) => {
    const actual = parseFloat(montoRecibidoStr) || total;
    setMontoRecibidoStr((actual + addVal).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (metodo === 'efectivo') {
      if (isNaN(montoRecibido) || montoRecibido <= 0) {
        setErrorLocal('Ingrese un monto recibido válido.');
        return;
      }
      if (montoRecibido < total) {
        setErrorLocal(`El monto recibido es insuficiente. Faltan S/ ${faltante.toFixed(2)}.`);
        return;
      }
      if (montoRecibido > 9999.99) {
        setErrorLocal('El monto recibido no puede exceder S/ 9,999.99.');
        return;
      }
    } else if (metodo === 'yape') {
      if (!yapeConfirmado) {
        setErrorLocal('Debe confirmar la verificación del pago en el aplicativo Yape.');
        return;
      }
      if (yapeReferencia && yapeReferencia.trim().length > 20) {
        setErrorLocal('La referencia de Yape no puede tener más de 20 caracteres.');
        return;
      }
    }

    const payload: CobroRequest = {
      pedidoId: pedido.pedidoId,
      solicitudId,
      totalMostrado: total,
      metodo,
      montoRecibido: metodo === 'efectivo' ? montoRecibido : total,
      yapeConfirmado: metodo === 'yape' ? true : undefined,
      yapeReferencia: metodo === 'yape' && yapeReferencia.trim() ? yapeReferencia.trim() : undefined,
    };

    try {
      await onConfirmarCobro(payload);
    } catch (err: any) {
      setErrorLocal(err.message || 'Error al procesar el cobro.');
    }
  };

  const canSubmit =
    !loading &&
    ((metodo === 'efectivo' && !isNaN(montoRecibido) && montoRecibido >= total) ||
      (metodo === 'yape' && yapeConfirmado));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cobro-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D35400] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Cobro en Caja
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500 font-mono">
                Hora: {pedido.hora}
              </span>
            </div>
            <h2
              id="modal-cobro-title"
              className="text-xl font-serif font-bold text-[#2C1A0E] tracking-tight"
            >
              Pedido N.º {pedido.numero}
            </h2>
            <p className="text-xs text-neutral-500">
              {pedido.tipo === 'Mesa' ? `Salón · ${pedido.mesa || 'Mesa'}` : 'Pedido Para Llevar'}
              {pedido.referencia && ` · Ref: ${pedido.referencia}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal de cobro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Total Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Total a Cobrar
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#D35400] tracking-tight">
                S/ {total.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 ${
                  pedido.estaListo
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {pedido.estaListo ? 'Listo para entrega' : 'En cocina / Salón'}
              </span>
            </div>
          </div>

          {errorLocal && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorLocal}</span>
            </div>
          )}

          {/* Método de Pago Selector */}
          <div>
            <label className="block text-xs font-bold text-[#2C1A0E] uppercase tracking-wider mb-2">
              Seleccione Medio de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodo('efectivo')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all cursor-pointer ${
                  metodo === 'efectivo'
                    ? 'bg-[#482813] text-white border-[#482813] shadow-sm'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <DollarSign className="w-5 h-5 shrink-0" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('yape')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all cursor-pointer ${
                  metodo === 'yape'
                    ? 'bg-[#732282] text-white border-[#732282] shadow-sm'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <Smartphone className="w-5 h-5 shrink-0" />
                <span>Yape / QR</span>
              </button>
            </div>
          </div>

          {/* Sección Efectivo */}
          {metodo === 'efectivo' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div>
                <label
                  htmlFor="monto-recibido-input"
                  className="block text-xs font-bold text-[#2C1A0E] uppercase tracking-wider mb-1.5"
                >
                  Monto Recibido del Cliente (S/)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-neutral-400">
                    S/
                  </span>
                  <input
                    id="monto-recibido-input"
                    type="number"
                    step="0.10"
                    min="0"
                    max="9999.99"
                    value={montoRecibidoStr}
                    onChange={(e) => setMontoRecibidoStr(e.target.value)}
                    autoFocus
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 text-neutral-900 text-xl font-bold font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Botones de sugerencia rápida */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Acceso rápido:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(total)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer"
                  >
                    Exacto (S/ {total.toFixed(2)})
                  </button>
                  {[20, 50, 100].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleQuickAmount(b)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer"
                    >
                      S/ {b}.00
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddAmount(10)}
                    className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-[#B84600] cursor-pointer"
                  >
                    +S/ 10
                  </button>
                </div>
              </div>

              {/* Cálculo en vivo de Vuelto / Faltante */}
              {montoRecibido >= total ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block text-emerald-700">
                        Vuelto a entregar
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald-900">
                        S/ {vuelto.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">
                    Pago cubierto
                  </span>
                </div>
              ) : !isNaN(montoRecibido) && montoRecibido > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#B84600] flex items-center justify-between">
                  <span>Monto menor al total requerido</span>
                  <span className="font-bold font-mono">
                    Faltan S/ {faltante.toFixed(2)}
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* Sección Yape */}
          {metodo === 'yape' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-white border border-purple-200 p-2 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#732282] uppercase tracking-wider">
                    YAPE QR
                  </span>
                  <Smartphone className="w-8 h-8 text-[#732282] my-1" />
                  <span className="text-[9px] text-neutral-500 font-mono">Girasoles</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm text-[#732282]">
                    Restaurante Girasoles E.I.R.L.
                  </p>
                  <p className="font-mono font-semibold text-neutral-700">
                    Número Yape: <strong>987 654 321</strong>
                  </p>
                  <p className="text-neutral-500 text-[11px]">
                    Solicite al cliente mostrar la confirmación en su pantalla o verifique la notificación en el teléfono de caja.
                  </p>
                </div>
              </div>

              {/* Checkbox obligatorio */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={yapeConfirmado}
                  onChange={(e) => setYapeConfirmado(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 w-4 h-4 text-[#D35400] rounded border-neutral-300 focus:ring-[#D35400]"
                />
                <span className="text-xs text-neutral-800 font-medium">
                  <strong>Confirmo haber verificado</strong> la recepción conforme del pago por <strong>S/ {total.toFixed(2)}</strong> en el aplicativo Yape.
                </span>
              </label>

              {/* Referencia opcional */}
              <div>
                <label
                  htmlFor="yape-ref-input"
                  className="block text-xs font-bold text-[#2C1A0E] uppercase tracking-wider mb-1"
                >
                  Número de operación / Referencia (Opcional)
                </label>
                <input
                  id="yape-ref-input"
                  type="text"
                  maxLength={20}
                  value={yapeReferencia}
                  onChange={(e) => setYapeReferencia(e.target.value)}
                  disabled={loading}
                  placeholder="Ej. 128492"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 text-neutral-900 text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
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
              disabled={!canSubmit}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 min-h-[44px] ${
                canSubmit
                  ? 'bg-[#D35400] hover:bg-[#B84600] cursor-pointer'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-70'
              }`}
            >
              {loading ? (
                <span>Emitiendo comprobante...</span>
              ) : (
                <>
                  <span>Confirmar Cobro y Emitir Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
