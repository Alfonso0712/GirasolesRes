import React, { useState, useRef, useEffect, useId, cloneElement, isValidElement } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    
    // Dimensiones del tooltip (estimadas o reales)
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 120;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 28;
    const gap = 8;
    const padding = 8;

    let targetPlacement = placement;

    // Detección de colisión vertical y flip
    if (placement === 'top' && triggerRect.top - tooltipHeight - gap < padding) {
      targetPlacement = 'bottom';
    } else if (placement === 'bottom' && triggerRect.bottom + tooltipHeight + gap > window.innerHeight - padding) {
      targetPlacement = 'top';
    }

    // Detección de colisión horizontal y flip
    if (placement === 'left' && triggerRect.left - tooltipWidth - gap < padding) {
      targetPlacement = 'right';
    } else if (placement === 'right' && triggerRect.right + tooltipWidth + gap > window.innerWidth - padding) {
      targetPlacement = 'left';
    }

    setActualPlacement(targetPlacement);

    let top = 0;
    let left = 0;

    switch (targetPlacement) {
      case 'top':
        top = triggerRect.top - tooltipHeight - gap;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
        left = triggerRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
        left = triggerRect.right + gap;
        break;
    }

    // Clamping para asegurar que nunca se salga de la pantalla
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    setCoords({ top, left });
  };

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      const handleResizeOrScroll = () => calculatePosition();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          hideTooltip();
        }
      };

      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll, true);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll, true);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!content) return children;

  const childProps = (children as any).props || {};

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          const { ref } = children as any;
          if (typeof ref === 'function') ref(node);
          else if (ref && typeof ref === 'object') (ref as any).current = node;
        },
        onMouseEnter: (e: React.MouseEvent) => {
          childProps.onMouseEnter?.(e);
          showTooltip();
        },
        onMouseLeave: (e: React.MouseEvent) => {
          childProps.onMouseLeave?.(e);
          hideTooltip();
        },
        onFocus: (e: React.FocusEvent) => {
          childProps.onFocus?.(e);
          showTooltip();
        },
        onBlur: (e: React.FocusEvent) => {
          childProps.onBlur?.(e);
          hideTooltip();
        },
        'aria-describedby': isVisible ? id : childProps['aria-describedby'],
      } as any)
    : children;

  return (
    <>
      {trigger}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            data-placement={actualPlacement}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className={`fixed z-50 pointer-events-none px-2.5 py-1 text-xs font-medium text-white bg-neutral-900/95 backdrop-blur-xs rounded-md shadow-lg border border-neutral-700/60 whitespace-nowrap animate-in fade-in duration-150 ${className}`}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
