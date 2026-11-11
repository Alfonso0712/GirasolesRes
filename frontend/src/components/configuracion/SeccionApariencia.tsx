import React, { useRef } from 'react';
import { Palette, Sun, Moon, Laptop, CheckCircle2 } from 'lucide-react';
import { useThemeMode, THEME_MODE_OPTIONS, type ThemeMode } from '../../hooks/useThemeMode';
import { useTextSize } from '../../hooks/useTextSize';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TextSizeSelector } from './TextSizeSelector';
import { Switch } from './Switch';
import { SettingsSection } from './SettingsSection';

export interface SeccionAparienciaProps {
  token?: string;
  className?: string;
}

export const SeccionApariencia: React.FC<SeccionAparienciaProps> = ({
  token,
  className = '',
}) => {
  const { mode, setMode } = useThemeMode(token);
  const { textSize, setTextSize } = useTextSize();
  const { reducedMotion, setReducedMotion } = useReducedMotion();

  const themeRadioRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleThemeKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % THEME_MODE_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + THEME_MODE_OPTIONS.length) % THEME_MODE_OPTIONS.length;
    } else {
      return;
    }

    const nextOption = THEME_MODE_OPTIONS[nextIndex];
    setMode(nextOption.id);
    themeRadioRefs.current[nextIndex]?.focus();
  };

  const getThemeIcon = (id: ThemeMode) => {
    switch (id) {
      case 'light':
        return <Sun className="w-4 h-4" aria-hidden="true" />;
      case 'dark':
        return <Moon className="w-4 h-4" aria-hidden="true" />;
      case 'auto':
        return <Laptop className="w-4 h-4" aria-hidden="true" />;
    }
  };

  return (
    <SettingsSection
      id="seccion-apariencia"
      icon={Palette}
      title="Apariencia"
      description="Personalice el tema visual, tamaño del texto y movimiento de la pantalla."
      className={className}
    >
      {/* Subsección: Selector de tema */}
      <div className="space-y-2.5">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-ink">Tema del sistema</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Elija entre tema claro, oscuro o sincronización automática con el sistema operativo.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Tema del sistema"
          className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-2.5 pt-1"
        >
          {THEME_MODE_OPTIONS.map((opt, index) => {
            const isSelected = mode === opt.id;
            return (
              <button
                key={opt.id}
                ref={(el) => {
                  themeRadioRefs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-label={opt.label}
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setMode(opt.id)}
                onKeyDown={(e) => handleThemeKeyDown(e, index)}
                className={`flex flex-col justify-between p-3 rounded-xl border-2 transition-all cursor-pointer relative text-left min-h-[5.5rem] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'border-accent bg-brand-tint text-accent shadow-xs ring-1 ring-accent/30'
                    : 'border-line hover:border-line-strong hover:bg-surface-raised bg-surface text-ink'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {getThemeIcon(opt.id)}
                    <span>{opt.label}</span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-line shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="text-[11px] text-ink-muted leading-snug">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line" />

      {/* Subsección: Tamaño del texto */}
      <TextSizeSelector value={textSize} onChange={setTextSize} />

      <div className="border-t border-line" />

      {/* Subsección: Reducir animaciones */}
      <Switch
        id="switch-reducir-animaciones"
        checked={reducedMotion}
        onChange={setReducedMotion}
        label="Reducir animaciones"
        description="Minimiza los movimientos y transiciones de la pantalla conservando indicadores de estado operativos."
      />
    </SettingsSection>
  );
};

export default SeccionApariencia;
