import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { ProductoCartaPublica } from '../../services/landingService';

export interface LandingArmadorModalProps {
  modalArmador: {
    abierto: boolean;
    tipo: 'desayuno' | 'almuerzo' | 'segundo';
    titulo: string;
    precio: number;
  };
  onCerrar: () => void;
  seleccionDesayunoBebida: string;
  setSeleccionDesayunoBebida: (val: string) => void;
  seleccionDesayunoPlato: string;
  setSeleccionDesayunoPlato: (val: string) => void;
  seleccionAlmuerzoEntrada: string;
  setSeleccionAlmuerzoEntrada: (val: string) => void;
  seleccionAlmuerzoSegundo: string;
  setSeleccionAlmuerzoSegundo: (val: string) => void;
  bebidasDesayuno: ProductoCartaPublica[];
  platosDesayuno: ProductoCartaPublica[];
  entradasAlmuerzo: ProductoCartaPublica[];
  segundosAlmuerzo: ProductoCartaPublica[];
  mensajeModalFeedback: string | null;
  onConfirmar: () => void;
}

export const LandingArmadorModal: React.FC<LandingArmadorModalProps> = ({
  modalArmador,
  onCerrar,
  seleccionDesayunoBebida,
  setSeleccionDesayunoBebida,
  seleccionDesayunoPlato,
  setSeleccionDesayunoPlato,
  seleccionAlmuerzoEntrada,
  setSeleccionAlmuerzoEntrada,
  seleccionAlmuerzoSegundo,
  setSeleccionAlmuerzoSegundo,
  bebidasDesayuno,
  platosDesayuno,
  entradasAlmuerzo,
  segundosAlmuerzo,
  mensajeModalFeedback,
  onConfirmar,
}) => {
  if (!modalArmador.abierto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-stone-200 overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#3A2211]">{modalArmador.titulo}</h3>
            <p className="text-xs text-stone-500">Simula tu combinación favorita del menú</p>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {modalArmador.tipo === 'desayuno' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  1. Bebida de Desayuno
                </label>
                <select
                  value={seleccionDesayunoBebida}
                  onChange={(e) => setSeleccionDesayunoBebida(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F4] border border-stone-300 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                >
                  {bebidasDesayuno.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  2. Sánguche / Plato
                </label>
                <select
                  value={seleccionDesayunoPlato}
                  onChange={(e) => setSeleccionDesayunoPlato(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F4] border border-stone-300 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                >
                  {platosDesayuno.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {modalArmador.tipo === 'almuerzo' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  1. Sopa o Entrada del Día
                </label>
                <select
                  value={seleccionAlmuerzoEntrada}
                  onChange={(e) => setSeleccionAlmuerzoEntrada(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F4] border border-stone-300 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                >
                  {entradasAlmuerzo.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  2. Plato de Fondo (Segundo)
                </label>
                <select
                  value={seleccionAlmuerzoSegundo}
                  onChange={(e) => setSeleccionAlmuerzoSegundo(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F4] border border-stone-300 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                >
                  {segundosAlmuerzo.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {modalArmador.tipo === 'segundo' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                1. Plato de Fondo (Segundo Criollo)
              </label>
              <select
                value={seleccionAlmuerzoSegundo}
                onChange={(e) => setSeleccionAlmuerzoSegundo(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F4] border border-stone-300 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              >
                {segundosAlmuerzo.map((p) => (
                  <option key={p.id} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mensajeModalFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{mensajeModalFeedback}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-200">
          <div>
            <span className="text-[11px] uppercase font-bold text-stone-400">Total</span>
            <p className="text-xl font-extrabold text-[#D35400] tabular-nums">
              S/ {modalArmador.precio.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCerrar}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={onConfirmar}
              className="px-5 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Elegir esta opción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
