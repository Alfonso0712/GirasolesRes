import React from 'react';
import { BellRing, Check } from 'lucide-react';
import type { AvisoComandaDto } from '../../types/pedido';

interface AvisoComandaModalProps {
  aviso: AvisoComandaDto | null;
  onCerrar: (avisoId: string) => void;
  cargando?: boolean;
}

export const AvisoComandaModal: React.FC<AvisoComandaModalProps> = ({
  aviso,
  onCerrar,
  cargando = false
}) => {
  if (!aviso) return null;

  const destino = aviso.tipo === 'Mesa'
    ? (aviso.mesa || 'Mesa')
    : `Para llevar${aviso.referencia ? ` (${aviso.referencia})` : ''}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-200 text-center relative animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-[#D35400] flex items-center justify-center mx-auto mb-4 animate-bounce">
          <BellRing className="w-8 h-8" />
        </div>

        <h3 id="aviso-title" className="text-xl sm:text-2xl font-sans font-bold text-[#2C1A0E] mb-2">
          ¡Pedido Listo para Recoger!
        </h3>

        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 mb-6 text-neutral-700 text-sm">
          <p className="font-semibold text-base text-neutral-900 mb-1">
            Pedido N.º {aviso.numero}
          </p>
          <p className="text-neutral-600">
            Destino: <span className="font-bold text-[#D35400]">{destino}</span>
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            Hora de despacho en cocina: {aviso.hora}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCerrar(aviso.id)}
          disabled={cargando}
          className="w-full py-3.5 px-6 rounded-xl bg-[#1B4332] text-white font-semibold text-sm hover:bg-[#143326] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{cargando ? 'Cerrando aviso…' : 'Entendido, recoger en cocina'}</span>
        </button>
      </div>
    </div>
  );
};

