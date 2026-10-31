import React from 'react';
import { UtensilsCrossed, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface CocinaHeaderActionsProps {
  onAbrirPlatosAgotados: () => void;
  sonidoActivado: boolean;
  onToggleSonido: () => void;
  segundosDesdeActualizacion: number;
  cargando: boolean;
  onActualizar: () => void;
}

export const CocinaHeaderActions: React.FC<CocinaHeaderActionsProps> = ({
  onAbrirPlatosAgotados,
  sonidoActivado,
  onToggleSonido,
  segundosDesdeActualizacion,
  cargando,
  onActualizar,
}) => {
  return (
    <div className="flex items-center gap-2.5 flex-wrap shrink-0">
      {/* Botón PLATOS AGOTADOS */}
      <button
        type="button"
        onClick={onAbrirPlatosAgotados}
        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-accent text-xs font-semibold flex items-center gap-2 border border-amber-200 shadow-2xs transition-all cursor-pointer min-h-[40px]"
        title="Abrir disponibilidad de platos del menú"
      >
        <UtensilsCrossed className="w-4 h-4 text-accent" />
        <span>Platos agotados</span>
      </button>

      {/* Botón SONIDO */}
      <button
        type="button"
        onClick={onToggleSonido}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[40px] shadow-2xs ${
          sonidoActivado
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            : 'bg-surface text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
        }`}
        title="Activar o desactivar sonido de nueva comanda"
      >
        {sonidoActivado ? (
          <>
            <Volume2 className="w-4 h-4 text-success" />
            <span>Sonido: ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-neutral-500" />
            <span>Sonido: OFF</span>
          </>
        )}
      </button>

      {/* Contador y Actualizar Manual */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 tabular-nums hidden sm:inline">
          Actualizado hace <span className="font-semibold text-neutral-700">{segundosDesdeActualizacion}</span> s
        </span>
        <button
          type="button"
          onClick={onActualizar}
          disabled={cargando}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60"
          title="Actualizar comandas manualmente"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-accent ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>
    </div>
  );
};
