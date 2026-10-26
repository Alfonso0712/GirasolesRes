import React from 'react';
import { ChefHat, Check, ArrowRight } from 'lucide-react';

export interface NuevoPedidoCocinaInfo {
  comandaId?: string;
  pedidoNumero: number;
  destino: string;
  itemsCount: number;
  hora?: string;
}

interface AvisoNuevoPedidoCocinaModalProps {
  aviso: NuevoPedidoCocinaInfo | null;
  onCerrar: () => void;
  onIrACocina?: () => void;
}

export const AvisoNuevoPedidoCocinaModal: React.FC<AvisoNuevoPedidoCocinaModalProps> = ({
  aviso,
  onCerrar,
  onIrACocina,
}) => {
  if (!aviso) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuevo-pedido-cocina-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-300 text-center relative animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-accent flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ChefHat className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-accent bg-amber-500/10 px-3 py-1 rounded-full">
          Nueva orden en cocina
        </span>

        <h3 id="nuevo-pedido-cocina-title" className="text-xl sm:text-2xl font-sans font-bold text-ink mt-3 mb-2">
          ¡Nuevo Pedido Recibido!
        </h3>

        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 mb-6 text-neutral-700 text-sm">
          <p className="font-semibold text-base text-neutral-900 mb-1">
            Pedido N.º {aviso.pedidoNumero}
          </p>
          <p className="text-neutral-600">
            Destino: <span className="font-bold text-accent">{aviso.destino}</span>
          </p>
          <p className="text-xs text-neutral-600 mt-2 font-medium">
            {aviso.itemsCount} {aviso.itemsCount === 1 ? 'porción' : 'porciones'} por preparar
          </p>
          {aviso.hora && (
            <p className="text-xs text-neutral-500 mt-1">
              Hora de registro: {aviso.hora}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {onIrACocina ? (
            <button
              type="button"
              onClick={() => {
                onCerrar();
                onIrACocina();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-accent text-neutral-950 font-bold text-sm hover:bg-amber-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <span>Ir a Pantalla de Cocina</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onCerrar}
              className="w-full py-3.5 px-6 rounded-xl bg-[#1B4332] text-white font-semibold text-sm hover:bg-[#143326] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Entendido, preparar orden</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
