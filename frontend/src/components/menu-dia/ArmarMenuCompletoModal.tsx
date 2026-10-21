import React, { useState, useEffect } from 'react';
import { Utensils, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MenuCompletoDia } from '../../types/menuDia';

interface ArmarMenuCompletoModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuCompletoDia | null;
  onConfirm: (
    elecciones: { parte: string; productoId: string; productoNombre: string }[],
    observacion: string
  ) => void;
}

export const ArmarMenuCompletoModal: React.FC<ArmarMenuCompletoModalProps> = ({
  isOpen,
  onClose,
  menu,
  onConfirm,
}) => {
  // Mapa de selección: { [parteNombre]: { productoId, productoNombre } }
  const [elecciones, setElecciones] = useState<Record<string, { productoId: string; productoNombre: string }>>({});
  const [observacion, setObservacion] = useState('');

  // Reiniciar estado al abrir
  useEffect(() => {
    if (isOpen && menu) {
      setElecciones({});
      setObservacion('');
    }
  }, [isOpen, menu]);

  if (!isOpen || !menu) return null;

  const partesOrdenadas = [...menu.partes].sort((a, b) => a.orden - b.orden);

  // Validación RV-163: exactamente una opción seleccionada por cada parte del menú
  const totalPartes = partesOrdenadas.length;
  const partesSeleccionadas = Object.keys(elecciones).length;
  const esCompleto = totalPartes > 0 && partesOrdenadas.every((p) => Boolean(elecciones[p.nombre]));

  const handleSeleccionarOpcion = (parteNombre: string, productoId: string, productoNombre: string, agotado: boolean) => {
    if (agotado) return;
    setElecciones((prev) => ({
      ...prev,
      [parteNombre]: { productoId, productoNombre }
    }));
  };

  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!esCompleto) return;

    const listaElecciones = partesOrdenadas.map((p) => ({
      parte: p.nombre,
      productoId: elecciones[p.nombre].productoId,
      productoNombre: elecciones[p.nombre].productoNombre
    }));

    onConfirm(listaElecciones, observacion.trim());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-armar-menu-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200/80">
        {/* Encabezado fijo */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-neutral-100 flex justify-between items-start bg-[#FAF7F4]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D35400] flex items-center justify-center shrink-0 mt-0.5">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-[#D35400] uppercase font-sans">
                Armar menú completo
              </span>
              <h2 id="modal-armar-menu-title" className="text-lg sm:text-xl font-bold font-sans text-[#2C1A0E] leading-tight">
                {menu.nombre}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-[#D35400] font-sans tabular-nums whitespace-nowrap">
                  S/ {menu.precio.toFixed(2)}
                </span>
                {menu.incluye && (
                  <span className="text-xs text-[#7C6F66] font-sans">
                    • Incluye {menu.incluye}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <form onSubmit={handleConfirmar} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {partesOrdenadas.map((parte, idx) => {
              const eleccionActual = elecciones[parte.nombre];
              const opcionesDisponibles = parte.opciones || [];
              const tieneOpciones = opcionesDisponibles.length > 0;

              return (
                <div key={parte.id || idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wide text-[#2C1A0E] flex items-center gap-1.5 font-sans">
                      <span className="w-4 h-4 rounded-full bg-neutral-100 text-[#7C6F66] text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {parte.nombre}
                      <span className="text-red-500 font-normal">*</span>
                    </label>
                    {eleccionActual ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {eleccionActual.productoNombre}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Elija una opción
                      </span>
                    )}
                  </div>

                  {!tieneOpciones ? (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>No hay opciones registradas para esta parte.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {opcionesDisponibles.map((opc) => {
                        const seleccionada = eleccionActual?.productoId === opc.productoId;
                        const agotada = opc.agotado;

                        return (
                          <button
                            key={opc.productoId}
                            type="button"
                            disabled={agotada}
                            onClick={() => handleSeleccionarOpcion(parte.nombre, opc.productoId, opc.nombre, agotada)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer font-sans min-h-[44px] h-auto ${
                              agotada
                                ? 'bg-neutral-50 border-neutral-200 opacity-60 cursor-not-allowed'
                                : seleccionada
                                ? 'bg-amber-50/70 border-[#D35400] ring-1 ring-[#D35400] text-[#2C1A0E]'
                                : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 text-[#2C1A0E]'
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-medium break-words text-wrap leading-snug mr-2">
                              {opc.nombre}
                            </span>
                            {agotada ? (
                              <span className="text-xs font-semibold px-1.5 py-0.5 bg-red-100 text-red-700 rounded shrink-0 ml-1">
                                Agotado
                              </span>
                            ) : seleccionada ? (
                              <span className="w-4 h-4 rounded-full bg-[#D35400] text-white flex items-center justify-center shrink-0 ml-1">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Observación opcional */}
            <div className="pt-2 border-t border-neutral-100">
              <label htmlFor="obs-menu-input" className="block text-xs font-semibold text-[#2C1A0E] mb-1 font-sans">
                Nota u observación especial (opcional)
              </label>
              <input
                id="obs-menu-input"
                type="text"
                maxLength={100}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej. Sin ensalada, bien caliente..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D35400] focus:border-[#D35400] font-sans"
              />
              <span className="text-xs text-neutral-500 mt-1 block text-right font-sans tabular-nums">
                {observacion.length}/100
              </span>
            </div>
          </div>

          {/* Barra de acciones fija en el pie */}
          <div className="shrink-0 p-4 border-t border-neutral-100 bg-[#FAF7F4] flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm text-neutral-700 hover:bg-neutral-100 border-neutral-300 !min-h-[40px] !w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!esCompleto}
              className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm ${
                esCompleto
                  ? 'bg-[#D35400] hover:bg-[#B94600] text-white cursor-pointer'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300'
              }`}
            >
              <span className="font-sans whitespace-nowrap">
                {esCompleto
                  ? `Agregar S/ ${menu.precio.toFixed(2)}`
                  : `Elija opciones (${partesSeleccionadas}/${totalPartes})`}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

