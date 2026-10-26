import React, { useEffect, useRef } from 'react';
import { X, type LucideIcon } from 'lucide-react';

export interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
  bodyClassName?: string;
  showCloseButton?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  icon: Icon,
  iconClassName = 'text-accent bg-primary/10',
  children,
  footer,
  maxWidth = 'md',
  className = '',
  bodyClassName = 'px-5 py-4 sm:px-6 sm:py-5',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const effectiveSubtitle = subtitle || description;

  // Keyboard navigation: Escape key & cyclic focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Cyclic focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableElements = Array.from(focusables).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initial focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const timer = setTimeout(() => {
        const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = Array.from(focusables || []).find(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );
        firstFocusable?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Ventana emergente'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClasses[maxWidth]} bg-surface-raised rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200/90 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden animate-in zoom-in-95 duration-150 ${className}`}
      >
        {(title || showCloseButton) && (
          <header className="px-5 py-4 sm:px-6 sm:py-5 border-b border-line flex items-center justify-between shrink-0 bg-surface">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {Icon && (
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-lg sm:text-xl font-bold font-sans text-ink tracking-tight truncate">
                    {title}
                  </h2>
                )}
                {effectiveSubtitle && (
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 truncate">
                    {effectiveSubtitle}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar ventana"
                className="modal-close-btn w-9 h-9 min-h-[36px] min-w-[36px] text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </header>
        )}

        <div className={`flex-1 overflow-y-auto [scrollbar-width:thin] ${bodyClassName}`}>
          {children}
        </div>

        {footer && (
          <footer className="px-5 py-3.5 sm:px-6 sm:py-4 bg-canvas border-t border-line flex items-center justify-end gap-3 rounded-b-2xl sm:rounded-b-3xl shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default ModalWrapper;
