import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useId,
  cloneElement,
  isValidElement,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [actualPlacement, setActualPlacement] = useState(placement);

  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const childProps = isValidElement(children) ? ((children as any).props || {}) : {};
  const isTriggerDisabled = Boolean(childProps.disabled);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const closeTooltip = useCallback(() => {
    clearTimer();
    setIsOpen(false);
    setCoords(null);
  }, [clearTimer]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();

    // Si el elemento disparador ya no es visible o fue desmontado
    if (triggerRect.width === 0 && triggerRect.height === 0) {
      closeTooltip();
      return;
    }

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;
    const gap = 8;
    const padding = 8;

    let targetPlacement = placement;

    // Detección de colisión vertical y flip
    if (placement === 'top' && triggerRect.top - tooltipHeight - gap < padding) {
      targetPlacement = 'bottom';
    } else if (
      placement === 'bottom' &&
      triggerRect.bottom + tooltipHeight + gap > window.innerHeight - padding
    ) {
      targetPlacement = 'top';
    }

    // Detección de colisión horizontal y flip
    if (placement === 'left' && triggerRect.left - tooltipWidth - gap < padding) {
      targetPlacement = 'right';
    } else if (
      placement === 'right' &&
      triggerRect.right + tooltipWidth + gap > window.innerWidth - padding
    ) {
      targetPlacement = 'left';
    }

    setActualPlacement(targetPlacement);

    let top = 0;
    let left = 0;

    switch (targetPlacement) {
      case 'top':
        top = triggerRect.top - tooltipHeight - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        left = triggerRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Clamping para asegurar que nunca se desborde la pantalla (mínimo 8px del borde)
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    setCoords({ top: Math.round(top), left: Math.round(left) });
  }, [placement, closeTooltip]);

  // Medición y posicionamiento sincrónico previo al pintado en pantalla
  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTooltip();
      }
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updatePosition, closeTooltip]);

  // Cierre automático si el elemento disparador se deshabilita
  useEffect(() => {
    if (isTriggerDisabled && isOpen) {
      closeTooltip();
    }
  }, [isTriggerDisabled, isOpen, closeTooltip]);

  // Limpieza de timers al desmontar el componente
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  if (!content) return children;

  const ariaLabel = childProps['aria-label'];
  const contentText = typeof content === 'string' ? content : undefined;
  // aria-describedby solo si el tooltip está activo, es texto y difiere del aria-label
  const shouldAriaDescribe = isOpen && coords !== null && contentText && contentText !== ariaLabel;
  const describedBy = shouldAriaDescribe
    ? childProps['aria-describedby']
      ? `${childProps['aria-describedby']} ${id}`
      : id
    : childProps['aria-describedby'];

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          const childRef = (children as any).ref;
          if (typeof childRef === 'function') {
            childRef(node);
          } else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
            childRef.current = node;
          }
        },
        onMouseEnter: (e: React.MouseEvent) => {
          childProps.onMouseEnter?.(e);
          if (isTriggerDisabled) return;
          clearTimer();
          timerRef.current = setTimeout(() => {
            setIsOpen(true);
          }, delay);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          childProps.onMouseLeave?.(e);
          closeTooltip();
        },
        onFocus: (e: React.FocusEvent) => {
          childProps.onFocus?.(e);
          if (isTriggerDisabled) return;
          // Mostrar por foco solo ante navegación de teclado (:focus-visible)
          try {
            if ((e.target as HTMLElement)?.matches(':focus-visible')) {
              clearTimer();
              setIsOpen(true);
            }
          } catch {
            // Ignorar para evitar falsos positivos de mouse
          }
        },
        onBlur: (e: React.FocusEvent) => {
          childProps.onBlur?.(e);
          closeTooltip();
        },
        onPointerDown: (e: React.PointerEvent) => {
          childProps.onPointerDown?.(e);
          closeTooltip();
        },
        onClick: (e: React.MouseEvent) => {
          childProps.onClick?.(e);
          closeTooltip();
        },
        'aria-describedby': describedBy,
      } as any)
    : children;

  const isPositioned = coords !== null;

  return (
    <>
      {trigger}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            data-placement={actualPlacement}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              transform: coords
                ? `translate3d(${coords.left}px, ${coords.top}px, 0)`
                : 'translate3d(-9999px, -9999px, 0)',
              visibility: isPositioned ? 'visible' : 'hidden',
              opacity: isPositioned ? 1 : 0,
            }}
            className={`z-50 pointer-events-none px-2.5 py-1 text-xs font-medium text-white bg-fill-strong/95 backdrop-blur-xs rounded-md shadow-lg border border-[#404040]/60 max-w-xs break-words transition-opacity duration-150 motion-reduce:transition-none ${className}`}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
