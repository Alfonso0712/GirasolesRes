import React from 'react';
import { Bell, Volume2, VolumeX, Play } from 'lucide-react';
import type { RolUsuario } from '../../types/auth';
import {
  useNotificationPrefs,
  MODOS_AVISO_OPTIONS,
  type ModoAviso,
} from '../../hooks/useNotificationPrefs';
import { Switch } from './Switch';

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
    <section className={`space-y-6 ${className}`} aria-labelledby="seccion-avisos-titulo">
      <div className="flex items-center gap-2 pb-2 border-b border-line">
        <div
          className="w-8 h-8 rounded-lg bg-brand-tint text-accent flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <h3 id="seccion-avisos-titulo" className="text-sm font-bold text-ink">
            Avisos y sonido
          </h3>
          <p className="text-xs text-ink-muted">
            Configure las alertas visuales y auditivas correspondientes a su rol ({rol}).
          </p>
        </div>
      </div>

      {/* Tarjeta descriptiva del aviso del rol */}
      <div className="p-3.5 rounded-2xl bg-surface-raised border border-line">
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

      {/* Control deslizante de volumen */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="slider-volumen" className="text-xs font-bold text-ink flex items-center gap-1.5">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-accent border border-accent/30 hover:bg-brand-tint/60 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Play className="w-3 h-3 fill-current" aria-hidden="true" />
            <span>Probar sonido</span>
          </button>
        </div>
      </div>

      <div className="border-t border-line" />

      {/* Modo de aviso */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-ink block">
          Modo del aviso
        </label>
        <p className="text-[11px] text-ink-muted">
          Seleccione cómo desea que se presenten las notificaciones en su pantalla.
        </p>

        <div
          role="radiogroup"
          aria-label="Modo del aviso"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1"
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
                className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative text-left min-h-[88px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'border-accent bg-brand-tint text-accent shadow-xs ring-1 ring-accent/30'
                    : 'border-line hover:border-line-strong hover:bg-surface-raised bg-surface text-ink'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-ink">{opt.label}</span>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-accent bg-accent text-white'
                        : 'border-line'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-snug">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SeccionAvisos;
