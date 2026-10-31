import React from 'react';
import { CheckCircle2, RefreshCw, Save } from 'lucide-react';

export interface MenuDiaStickyFooterProps {
  esAdmin: boolean;
  tabActiva: string;
  tieneCambiosSinGuardar: boolean;
  guardando: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export const MenuDiaStickyFooter: React.FC<MenuDiaStickyFooterProps> = ({
  esAdmin,
  tabActiva,
  tieneCambiosSinGuardar,
  guardando,
  onDiscard,
  onSave,
}) => {
  if (!esAdmin || tabActiva === 'disponibilidad' || !tieneCambiosSinGuardar) {
    return null;
  }

  return (
    <div className="sticky bottom-0 z-50 w-full bg-surface/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-3.5 mt-auto">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {tieneCambiosSinGuardar ? (
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-neutral-900">
                  Tiene cambios pendientes sin publicar
                </p>
                <p className="text-xs sm:text-xs text-neutral-500 hidden sm:block">
                  Haga clic en Guardar para actualizar las opciones y menús disponibles hoy.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>El menú actual está publicado y guardado.</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {tieneCambiosSinGuardar && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={guardando}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-neutral-700 bg-surface hover:bg-neutral-50 border border-neutral-300 rounded-xl transition-colors cursor-pointer min-h-[42px]"
            >
              Descartar cambios
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={guardando}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer min-h-[42px]"
          >
            {guardando ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando…</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>GUARDAR MENÚ DEL DÍA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
