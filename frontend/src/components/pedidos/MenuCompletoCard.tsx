import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button, Tooltip } from '../ui';
import type { MenuCompletoDia } from '../../types/menuDia';

export interface MenuCompletoCardProps {
  menu: MenuCompletoDia;
  cantEnBorrador: number;
  onArmarMenu: (menu: MenuCompletoDia) => void;
}

export const MenuCompletoCard: React.FC<MenuCompletoCardProps> = ({
  menu,
  cantEnBorrador,
  onArmarMenu,
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [esTruncado, setEsTruncado] = useState(false);

  const verificarTruncado = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    setEsTruncado(el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    verificarTruncado();
    const el = titleRef.current;
    if (!el) return;
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => verificarTruncado())
        : null;
    observer?.observe(el);
    window.addEventListener('resize', verificarTruncado, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', verificarTruncado);
    };
  }, [menu.nombre, verificarTruncado]);

  const disponible = menu.disponible !== false;

  return (
    <div
      className={`bg-canvas border rounded-xl p-3.5 flex flex-col justify-between transition-all relative ${
        !disponible
          ? 'border-neutral-300/80 text-neutral-500 select-none opacity-65'
          : cantEnBorrador > 0
          ? 'border-accent shadow-xs ring-1 ring-accent/20'
          : 'border-amber-300/80 hover:border-accent shadow-2xs hover:shadow-sm'
      }`}
    >
      {cantEnBorrador > 0 && disponible && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs z-10 tabular-nums">
          {cantEnBorrador}
        </span>
      )}

      <div>
        <div className="flex items-start justify-between gap-2">
          <Tooltip content={esTruncado ? menu.nombre : null}>
            <h4
              ref={titleRef}
              tabIndex={esTruncado ? 0 : undefined}
              className="font-sans text-base font-semibold text-ink leading-snug line-clamp-2 break-words min-w-0 flex-1"
            >
              {menu.nombre}
            </h4>
          </Tooltip>
          <span className="font-sans text-base font-bold text-accent tabular-nums whitespace-nowrap shrink-0">
            S/ {menu.precio.toFixed(2)}
          </span>
        </div>

        {menu.incluye && (
          <p className="text-xs text-ink-muted mt-1 line-clamp-2">
            Incluye: {menu.incluye}
          </p>
        )}
      </div>

      <div className="mt-auto pt-3">
        <Button
          type="button"
          variant="primary"
          disabled={!disponible}
          onClick={() => onArmarMenu(menu)}
          className="w-full py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[38px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{disponible ? 'Armar menú' : 'No disponible hoy'}</span>
        </Button>
      </div>
    </div>
  );
};

export default MenuCompletoCard;
