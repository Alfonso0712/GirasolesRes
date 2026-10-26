import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  value: string | number;
  onChange: (e: { target: { value: string; name?: string } }) => void;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  helperText?: string;
  className?: string;
  selectClassName?: string;
  leftIcon?: React.ReactNode;
  'aria-label'?: string;
}

export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  onValueChange,
  options,
  placeholder = 'Seleccione una opción',
  disabled = false,
  required = false,
  error = null,
  helperText,
  className = '',
  selectClassName = '',
  leftIcon,
  'aria-label': ariaLabel,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Adjust scroll when highlighted index changes
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled || disabled) return;
    const stringVal = String(option.value);
    onChange({ target: { value: stringVal, name } });
    if (onValueChange) {
      onValueChange(stringVal);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown' || e.key === 'Down') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex((o) => String(o.value) === String(value)));
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex((o) => String(o.value) === String(value)));
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) {
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (opt && !opt.disabled) {
            handleSelect(opt);
          }
        }
      } else {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex((o) => String(o.value) === String(value)));
      }
    } else if (e.key === 'Escape' || e.key === 'Esc') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    } else if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={`relative text-left ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="form-label-standard"
        >
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              setHighlightedIndex(options.findIndex((o) => String(o.value) === String(value)));
            }
          }}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm font-normal text-left transition-all duration-150 flex items-center justify-between gap-2 select-none cursor-pointer focus:outline-hidden focus:ring-2 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${
            error
              ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
              : 'border-line-strong bg-surface text-neutral-800 hover:border-neutral-300 focus:border-accent focus:ring-accent/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100 text-neutral-400' : ''} ${selectClassName}`}
        >
          {leftIcon && (
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {leftIcon}
            </span>
          )}

          <span className={`block truncate ${!selectedOption ? 'text-neutral-400' : 'text-neutral-900'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <ChevronDown
            className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-accent' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              highlightedIndex >= 0 ? `${selectId}-opt-${highlightedIndex}` : undefined
            }
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-surface border border-neutral-200/90 shadow-lg py-1 text-sm focus:outline-hidden [scrollbar-width:thin] animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {options.length === 0 ? (
              <li className="px-3.5 py-2 text-xs text-neutral-400 italic">No hay opciones</li>
            ) : (
              options.map((option, idx) => {
                const isSelected = String(option.value) === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={`${option.value}-${idx}`}
                    id={`${selectId}-opt-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => !option.disabled && setHighlightedIndex(idx)}
                    className={`px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      option.disabled
                        ? 'opacity-40 cursor-not-allowed bg-transparent text-neutral-400'
                        : isSelected
                        ? 'bg-primary/10 text-ink font-semibold'
                        : isHighlighted
                        ? 'bg-canvas text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-neutral-400 font-normal truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-neutral-500 mt-1 font-normal">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-danger mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Select;
