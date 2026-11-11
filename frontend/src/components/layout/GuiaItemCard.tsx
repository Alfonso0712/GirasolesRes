import React from 'react';
import type { GuiaItem } from '../../types/guia';

export interface GuiaItemCardProps {
  item: GuiaItem;
}

/** Tarjeta de presentación de un módulo dentro de la guía del sistema. */
export const GuiaItemCard: React.FC<GuiaItemCardProps> = ({ item }) => {
  const Icono = item.icono;

  return (
    <article className="flex items-start gap-3 p-4 bg-surface border border-line border-l-4 border-l-accent rounded-xl">
      <div
        className="w-9 h-9 rounded-lg bg-brand-tint text-accent flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <Icono className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-ink text-sm">{item.titulo}</h4>
        <p className="text-sm text-ink-muted mt-0.5">{item.descripcion}</p>
      </div>
    </article>
  );
};

export default GuiaItemCard;
