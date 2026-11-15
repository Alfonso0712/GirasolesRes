import React from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { formatCurrency, pluralizar } from '../../utils/format';
import { ContenidoComanda } from './ContenidoComanda';
import type { ContenidoComandaProps } from './ContenidoComanda';

export interface ResumenComandaMovilProps {
  contenido: ContenidoComandaProps;
  abierto: boolean;
  tituloSheet: string;
  onAbrir: () => void;
  onCerrar: () => void;
}

function etiquetaBotonMovil(esMesa: boolean, esMozo: boolean, totalItems: number): string {
  if (!esMesa) return `Ver Orden (${pluralizar(totalItems, 'producto', 'productos')})`;
  return esMozo ? 'Ver Comanda de Sala' : 'Ver Detalle del Pedido';
}

/**
 * Barra inferior táctil y hoja modal inferior del resumen de comanda en móviles.
 */
export const ResumenComandaMovil: React.FC<ResumenComandaMovilProps> = ({
  contenido,
  abierto,
  tituloSheet,
  onAbrir,
  onCerrar,
}) => {
  const { variante, lineas, total, totalItems } = contenido.config;
  const esMozo = Boolean(contenido.extra.esMozo);
  const esMesa = variante === 'mesa';

  return (
    <>
      {lineas.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-line shadow-2xl safe-bottom z-30">
          <button type="button" onClick={onAbrir} className="handed-bar w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-98 transition-all min-h-[56px] cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center font-black text-xs">{totalItems}</div>
              <span className="text-sm font-bold tracking-wide">{etiquetaBotonMovil(esMesa, esMozo, totalItems)}</span>
            </div>
            <div className={esMesa ? 'text-sm font-black' : 'text-sm font-black tabular-nums'}>
              {esMesa && esMozo ? pluralizar(totalItems, 'plato', 'platos') : formatCurrency(total)}
            </div>
          </button>
        </div>
      )}
      <div className="md:hidden">
        <BottomSheet isOpen={abierto} onClose={onCerrar} title={tituloSheet}>
          <ContenidoComanda {...contenido} />
        </BottomSheet>
      </div>
    </>
  );
};
