import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, AlertCircle, UtensilsCrossed, RefreshCw } from 'lucide-react';
import { menuDiaService } from '../../services/menuDiaService';
import type { PlatoMenu } from '../../types/menuDia';

interface PlatosAgotadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export const PlatosAgotadosModal: React.FC<PlatosAgotadosModalProps> = ({
  isOpen,
  onClose,
  token
}) => {
  const [platos, setPlatos] = useState<PlatoMenu[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const cargarPlatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await menuDiaService.obtenerMenuHoy(token);
      if (res && res.platos) {
        setPlatos(res.platos);
      } else {
        setPlatos([]);
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el menú del día.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      cargarPlatos();
    }
  }, [isOpen, cargarPlatos]);

  const handleToggleDisponibilidad = async (plato: PlatoMenu) => {
    setProcesandoId(plato.productoId);
    try {
      const nuevoEstado = !plato.agotado;
      await menuDiaService.cambiarDisponibilidad(
        plato.productoId,
        { agotado: nuevoEstado },
        token
      );
      setPlatos((prev) =>
        prev.map((p) =>
          p.productoId === plato.productoId ? { ...p, agotado: nuevoEstado } : p
        )
      );
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar la disponibilidad.');
    } finally {
      setProcesandoId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="platos-agotados-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-neutral-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 id="platos-agotados-title" className="text-xl font-sans font-bold text-[#2C1A0E]">
                Disponibilidad de Platos
              </h3>
              <p className="text-xs text-neutral-500">
                Marque como agotado o disponible en tiempo real para salón y pedidos.
              </p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {cargando ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#D35400]" />
              <span className="text-sm">Cargando platos del día…</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : platos.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-sm">
              No hay platos definidos en el menú del día de hoy.
            </div>
          ) : (
            platos.map((plato) => {
              const estaProcesando = procesandoId === plato.productoId;
              return (
                <div
                  key={plato.productoId}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    plato.agotado
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-white border-neutral-200 text-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">{plato.nombre}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          plato.agotado
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {plato.agotado ? 'Agotado' : 'Disponible'}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 capitalize">
                      Categoría: {plato.categoria}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDisponibilidad(plato)}
                    disabled={estaProcesando}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer min-h-[44px] ${
                      plato.agotado
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {estaProcesando ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : plato.agotado ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{plato.agotado ? 'Habilitar' : 'Marcar Agotado'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-neutral-800 text-white text-sm font-semibold hover:bg-neutral-900 transition-colors cursor-pointer min-h-[44px]"
          >
            Listo, volver a cocina
          </button>
        </div>
      </div>
    </div>
  );
};

