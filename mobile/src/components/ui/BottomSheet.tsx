import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';

interface BottomSheetProps {
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    triggerLight();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="relative bg-surface rounded-t-3xl border-t border-line shadow-2xl z-10 max-h-[85vh] flex flex-col w-full max-w-lg mx-auto animate-in slide-in-from-bottom duration-250 safe-bottom">
        {/* Drag Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-grab">
          <div className="w-12 h-1.5 bg-line rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-line shrink-0">
          <h2 className="text-base font-bold text-ink truncate">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar panel"
            className="w-9 h-9 rounded-full bg-canvas text-ink-muted hover:text-ink active:scale-95 flex items-center justify-center transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
