import React from 'react';
import { X, Clock, User, AlertCircle, ChefHat, CheckCircle2, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import type { DetallePedidoCompletoDto } from '../../types/pedido';

interface DetallePedidoModalProps {
  pedido: DetallePedidoCompletoDto | null;
  isOpen: boolean;
  onClose: () => void;
  onAbrirModificar?: (pedidoId: string) => void;
  onAbrirAnular?: (pedidoId: string) => void;
  puedeModificar?: boolean;
  puedeAnular?: boolean;
  motivoDeshabilitado?: string | null;
}

export const DetallePedidoModal: React.FC<DetallePedidoModalProps> = ({
  pedido,
  isOpen,
  onClose,
  onAbrirModificar,
  onAbrirAnular,
  puedeModificar = false,
  puedeAnular = false,
  motivoDeshabilitado
}) => {
  if (!isOpen || !pedido) return null;

  const destino = pedido.tipo === 'Mesa'
    ? (pedido.mesa || 'Mesa')
    : `Para llevar${pedido.referencia ? ` (${pedido.referencia})` : ''}`;

  const renderBadgeEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
      case 'enpreparacion':
      case 'en preparación':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <ChefHat className="w-3.5 h-3.5" />
            En preparación
          </span>
        );
      case 'listo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Listo
          </span>
        );
      case 'pagado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
            Pagado
          </span>
        );
      case 'anulado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Anulado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-3">
              <h3 id="detalle-title" className="text-xl font-sans font-bold text-[#2C1A0E]">
                Pedido N.º {pedido.numero}
              </h3>
              {renderBadgeEstado(pedido.estado)}
            </div>
            <p className="text-sm font-semibold text-[#D35400] mt-0.5">{destino}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadatos */}
        <div className="grid grid-cols-2 gap-3 py-3 text-xs text-neutral-600 bg-neutral-50/70 px-4 rounded-xl my-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span>Hora de registro: <strong>{pedido.hora}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-500" />
            <span>Registrado por: <strong>{pedido.registradoPor}</strong></span>
          </div>
        </div>

        {/* Motivo de anulación si aplica */}
        {pedido.estado.toLowerCase() === 'anulado' && pedido.motivoAnulacion && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Motivo de anulación: </span>
              <span>{pedido.motivoAnulacion}</span>
            </div>
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Tabla de Productos */}
          <div>
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Líneas del Pedido
            </h4>
            <div className="border border-neutral-200 rounded-xl overflow-hidden text-sm shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FAF7F4] text-[#7C6F66] font-semibold text-xs uppercase tracking-wider border-b border-[#E5E0DB]">
                  <tr>
                    <th className="py-2.5 px-3 w-14 text-center">Cant.</th>
                    <th className="py-2.5 px-3">Plato / Bebida</th>
                    <th className="py-2.5 px-3 text-right w-24">P. Unit.</th>
                    <th className="py-2.5 px-3 text-right w-24">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6]">
                  {pedido.lineas.map((linea) => (
                    <tr key={linea.detalleId} className="hover:bg-neutral-50/50 border-b border-[#F0EBE6]">
                      <td className="py-2.5 px-3 font-semibold text-sm text-[#2C1A0E] text-center tabular-nums">
                        {linea.cantidad}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-sm text-[#2C1A0E]">{linea.nombre}</div>
                        {linea.observacion && (
                          <div className="text-xs text-[#D35400] italic mt-0.5">
                            Nota: {linea.observacion}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-600 text-xs tabular-nums">
                        S/ {linea.precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#2C1A0E] text-sm tabular-nums">
                        S/ {linea.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total general */}
            <div className="flex justify-between items-center mt-3 px-2">
              <span className="text-sm font-semibold text-neutral-600">Total del Pedido:</span>
              <span className="text-xl font-bold tabular-nums text-[#D35400]">
                S/ {pedido.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Estado de Comandas */}
          {pedido.comandas && pedido.comandas.length > 0 && (
            <div className="pt-2 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Comandas en Cocina ({pedido.comandas.length})
              </h4>
              <div className="space-y-2">
                {pedido.comandas.map((c) => (
                  <div
                    key={c.comandaId}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold text-neutral-800">
                        Comanda N.º {c.numero}
                      </span>
                      {c.esAdicional && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs">
                          Adicional
                        </span>
                      )}
                      {c.modificada && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs">
                          Modificada
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-neutral-700">
                      Estado: {c.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="pt-4 border-t border-neutral-100 mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          {motivoDeshabilitado && (
            <p className="text-xs text-neutral-500 italic text-center sm:text-left">
              {motivoDeshabilitado}
            </p>
          )}

          <div className="flex gap-2 w-full sm:w-auto ml-auto">
            {onAbrirModificar && puedeModificar && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAbrirModificar(pedido.id);
                }}
                className="py-2.5 px-4 rounded-xl border border-[#D35400] text-[#D35400] font-semibold text-xs hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modificar</span>
              </button>
            )}

            {onAbrirAnular && puedeAnular && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAbrirAnular(pedido.id);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 font-semibold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Anular</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-neutral-100 text-neutral-700 font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer min-h-[44px]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

