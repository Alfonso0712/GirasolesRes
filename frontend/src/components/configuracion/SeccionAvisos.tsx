import React from 'react';
import { Bell, Volume2, VolumeX, Play, CheckCircle2 } from 'lucide-react';
import type { RolUsuario } from '../../types/auth';
import {
  useNotificationPrefs,
  MODOS_AVISO_OPTIONS,
  type ModoAviso,
} from '../../hooks/useNotificationPrefs';
import { Switch } from './Switch';
import { SettingsSection } from './SettingsSection';

export interface SeccionAvisosProps {
  rol: RolUsuario;
  className?: string;
}

export const SeccionAvisos: React.FC<SeccionAvisosProps> = ({
  rol,
  className = '',
}) => {
  const { prefs, setSonidoActivado, setVolumen, setModoAviso, probarSonido } =
    useNotificationPrefs();

  const esCocinero = rol === 'Cocinero';
  const tipoSonido = esCocinero ? 'pendiente' : 'lista';

  const tituloAvisoRol = esCocinero
    ? 'Aviso de nueva comanda entrante'
    : 'Aviso de comanda lista para recoger';

  const descripcionAvisoRol = esCocinero
    ? 'Se emite al ingresar comandas pendientes a la pantalla de cocina (KDS).'
    : 'Se emite cuando la cocina marca un pedido o mesa listo para servir.';

  return (
    <SettingsSection
      id="seccion-avisos"
      icon={Bell}
      title="Avisos y sonido"
      description={`Configure las alertas visuales y auditivas correspondientes a su rol (${rol}).`}
      className={className}
    >
      {/* Tarjeta descriptiva del aviso del rol */}
      <div className="p-3 rounded-xl bg-surface-raised/60 border border-line">
        <span className="text-xs font-bold text-ink block">{tituloAvisoRol}</span>
        <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
          {descripcionAvisoRol}
        </p>
      </div>

      {/* Interruptor de sonido */}
      <Switch
        id="switch-sonido-avisos"
        checked={prefs.sonidoActivado}
        onChange={setSonidoActivado}
        label="Sonido en avisos"
        description="Reproduce tonos audibles al recibir nuevas alertas de comandas o pedidos listos."
      />

      <div className="border-t border-line" />

      {/* Control deslizante de volumen */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="slider-volumen" className="text-sm font-semibold text-ink flex items-center gap-1.5 cursor-pointer">
            {prefs.sonidoActivado && prefs.volumen > 0 ? (
              <Volume2 className="w-4 h-4 text-accent" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 text-ink-muted" aria-hidden="true" />
            )}
            <span>Volumen de alertas</span>
          </label>
          <span className="text-xs font-bold text-accent">
            {prefs.sonidoActivado ? `${prefs.volumen}%` : 'Silenciado'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="slider-volumen"
            type="range"
            min="0"
            max="100"
            step="10"
            value={prefs.volumen}
            disabled={!prefs.sonidoActivado}
            onChange={(e) => setVolumen(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Volumen de alertas"
          />

          <button
            type="button"
            disabled={!prefs.sonidoActivado || prefs.volumen === 0}
            onClick={() => probarSonido(tipoSonido)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-accent border border-accent/30 hover:bg-brand-tint/60 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]"
          >
            <Play className="w-3 h-3 fill-current" aria-hidden="true" />
            <span>Probar sonido</span>
          </button>
        </div>
      </div>

      <div className="border-t border-line" />

      {/* Modo de aviso */}
      <div className="space-y-2.5">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-ink">Modo del aviso</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Seleccione cómo desea que se presenten las notificaciones en su pantalla.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Modo del aviso"
          className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-2.5 pt-1"
        >
          {MODOS_AVISO_OPTIONS.map((opt) => {
            const isSelected = prefs.modoAviso === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-label={opt.label}
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setModoAviso(opt.id as ModoAviso)}
                className={`flex flex-col justify-between p-3 rounded-xl border-2 transition-all cursor-pointer relative text-left min-h-[5.5rem] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'border-accent bg-brand-tint text-accent shadow-xs ring-1 ring-accent/30'
                    : 'border-line hover:border-line-strong hover:bg-surface-raised bg-surface text-ink'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-ink">{opt.label}</span>
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
    </SettingsSection>
  );
};

export default SeccionAvisos;
