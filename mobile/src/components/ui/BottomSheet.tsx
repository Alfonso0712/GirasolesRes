import React, { useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';
import { useBackHandler } from '../../hooks/useBackHandler';
import { IconButton } from './IconButton';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const { triggerLight } = useHaptics();
  const titleId = useId();

  useEffect(() => {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      mainContent?.setAttribute('inert', '');
    } else {
      document.body.style.overflow = '';
      mainContent?.removeAttribute('inert');
    }
    return () => {
      document.body.style.overflow = '';
      mainContent?.removeAttribute('inert');
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    triggerLight();
    onClose();
  }, [onClose, triggerLight]);

  // Registro automático en la pila de botón Atrás de Android
  useBackHandler(isOpen, handleClose);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="relative bg-surface rounded-t-3xl border-t border-line shadow-2xl z-10 max-h-[85vh] flex flex-col w-full max-w-lg mx-auto animate-in slide-in-from-bottom duration-250 safe-bottom">
        {/* Drag Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-grab" aria-hidden="true">
          <div className="w-12 h-1.5 bg-line rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between gap-2 border-b border-line shrink-0">
          <h2 id={titleId} className="text-base font-bold text-ink leading-tight break-words min-w-0">
            {title}
          </h2>
          <IconButton
            variant="ghost"
            onClick={handleClose}
            aria-label="Cerrar"
            className="w-11 h-11"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </IconButton>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};
