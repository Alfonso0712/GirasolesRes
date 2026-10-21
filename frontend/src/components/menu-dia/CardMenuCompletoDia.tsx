import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface CardMenuCompletoDiaProps {
  id: number;
  nombre: string;
  precio: number;
  incluye: string;
  habilitado: boolean;
  onToggle: () => void;
  partes: {
    nombre: string;
    opciones: string[];
  }[];
}

export const CardMenuCompletoDia: React.FC<CardMenuCompletoDiaProps> = ({
  nombre,
  precio,
  incluye,
  habilitado,
  onToggle,
  partes
}) => {
  // Comprobar si cada parte tiene opciones seleccionadas (RV-161)
  const partesConFalta = partes.filter((p) => p.opciones.length === 0);
  const cumpleRV161 = partesConFalta.length === 0;

  return (
    <div
      className={`rounded-2xl border p-5 xl:p-6 flex flex-col justify-between transition-all ${
        habilitado
          ? 'bg-white border-[#D35400] shadow-sm'
          : 'bg-neutral-50/80 border-neutral-200 opacity-80'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-sans font-bold text-neutral-900 text-base xl:text-lg">
              {nombre}
            </h3>
            <span className="text-lg xl:text-xl font-sans font-bold tabular-nums whitespace-nowrap text-[#D35400]">
              S/ {precio.toFixed(2)}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={habilitado}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D35400]"></div>
          </label>
        </div>

        <p className="text-xs text-neutral-500 mb-4">
          Incluye: <strong>{incluye}</strong>
        </p>

        {/* RESUMEN DE PARTES Y OPCIONES */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          {partes.map((p) => (
            <div key={p.nombre} className="text-xs">
              <span className="font-bold text-neutral-700 block mb-1">
                Parte: {p.nombre}
              </span>
              {p.opciones.length === 0 ? (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                  Falta elegir opciones
                </span>
              ) : (
                <span className="text-xs text-neutral-600 block line-clamp-2">
                  {p.opciones.length} opción(es): {p.opciones.join(', ')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {habilitado && !cumpleRV161 && (
        <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            {nombre} necesita al menos una opción en &quot;
            {partesConFalta[0]?.nombre}&quot;. Seleccione opciones o quite el menú de hoy.
          </span>
        </div>
      )}
    </div>
  );
};

export default CardMenuCompletoDia;
