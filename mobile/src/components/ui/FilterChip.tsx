import React from 'react';
import { useHaptics } from '../../hooks/useHaptics';

export interface FilterChipProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  className?: string;
  id?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active,
  onClick,
  className = '',
  id,
}) => {
  const { triggerLight } = useHaptics();

  const handleClick = () => {
    triggerLight();
    onClick();
  };

  return (
    <button
      id={id}
      type="button"
      aria-pressed={active}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[44px] shrink-0 select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent outline-hidden ${
        active
          ? 'bg-primary text-white shadow-xs'
          : 'bg-canvas text-ink-muted hover:text-ink border border-line active:bg-surface'
      } ${className}`}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-xs font-black tabular-nums ${
            active ? 'bg-white/20 text-white' : 'bg-surface text-ink-muted border border-line'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
