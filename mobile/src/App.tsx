import React, { useState } from 'react';
import { Utensils, ChefHat, Receipt, Bell, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';

export const App: React.FC = () => {
  const [rolActivo, setRolActivo] = useState<'Mozo' | 'Cocinero' | 'Cajero'>('Mozo');
  const [isDark, setIsDark] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-canvas text-ink overflow-hidden safe-top safe-bottom">
      {/* 1. Cabecera Móvil Compacta */}
      <header className="h-14 bg-brand-dark text-white px-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-base shadow-xs">
            G
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-wide">Girasoles Res</h1>
            <p className="text-[10px] text-amber-200/80 uppercase font-medium">Terminal {rolActivo}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={isDark ? "Modo Claro" : "Modo Oscuro"}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-transform"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-100" />}
        </button>
      </header>

      {/* 2. Selector de Rol Operativo (Para Pruebas en Mobile y Tablet) */}
      <section className="bg-surface border-b border-line px-3 py-2 shrink-0">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-canvas rounded-xl">
          <button
            type="button"
            onClick={() => setRolActivo('Mozo')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              rolActivo === 'Mozo'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Mozo</span>
          </button>

          <button
            type="button"
            onClick={() => setRolActivo('Cocinero')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              rolActivo === 'Cocinero'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Cocinero</span>
          </button>

          <button
            type="button"
            onClick={() => setRolActivo('Cajero')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              rolActivo === 'Cajero'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Cajero</span>
          </button>
        </div>
      </section>

      {/* 3. Área de Contenido Principal (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Banner de Estado Operativo */}
        <div className="bg-surface border border-line rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-bg border border-success-border text-success flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">Modo Mobile y Tablet Activo</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Optimizada para pantalla táctil y empaquetado en APK Capacitor.
              </p>
            </div>
          </div>
        </div>

        {/* Vista previa del rol seleccionado */}
        {rolActivo === 'Mozo' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Mesas del Salón</h3>
              <span className="text-[11px] font-semibold text-primary bg-chip-accent-bg border border-chip-accent-border px-2 py-0.5 rounded-full">
                4 Libres · 2 Ocupadas
              </span>
            </div>

            {/* Grilla Táctil de Mesas (2 col en mobile, 3-4 en tablet) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { num: 1, cap: 4, estado: 'libre', tiempo: null },
                { num: 2, cap: 2, estado: 'ocupada', tiempo: '24 min' },
                { num: 3, cap: 4, estado: 'libre', tiempo: null },
                { num: 4, cap: 6, estado: 'ocupada', tiempo: '45 min' },
                { num: 5, cap: 2, estado: 'libre', tiempo: null },
                { num: 6, cap: 8, estado: 'libre', tiempo: null },
              ].map((m) => (
                <button
                  key={m.num}
                  type="button"
                  className={`p-3.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between min-h-[96px] shadow-xs ${
                    m.estado === 'libre'
                      ? 'bg-surface border-success-border/60 hover:border-success'
                      : 'bg-surface border-danger-border/60 hover:border-danger'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-extrabold text-ink">Mesa {m.num}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        m.estado === 'libre'
                          ? 'bg-success-bg text-success border border-success-border'
                          : 'bg-danger-bg text-danger border border-danger-border'
                      }`}
                    >
                      {m.estado}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted mt-2 flex justify-between items-center">
                    <span>{m.cap} personas</span>
                    {m.tiempo && <span className="font-semibold text-danger">{m.tiempo}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {rolActivo === 'Cocinero' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Comandas en Cocina (KDS)</h3>
            <div className="bg-surface border border-line rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-ink">Comanda #12 · Mesa 4</span>
                <span className="text-xs font-semibold text-warning bg-warning-bg border border-warning-border px-2 py-0.5 rounded-full">
                  12 min
                </span>
              </div>
              <ul className="text-xs space-y-1.5 text-ink-muted border-y border-line py-2">
                <li className="font-medium text-ink">1x Lomo Saltado (Término medio)</li>
                <li className="font-medium text-ink">2x Arroz con Mariscos</li>
              </ul>
              <button
                type="button"
                className="w-full bg-primary text-white font-bold py-3 rounded-xl min-h-[48px] active:scale-98 shadow-xs flex items-center justify-center gap-2 text-sm"
              >
                <span>Empezar Preparación</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {rolActivo === 'Cajero' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Caja y Cobro Rápido</h3>
            <div className="bg-surface border border-line rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-ink">Mesa 2 · Cuenta por Cobrar</span>
                <span className="text-sm font-extrabold text-primary">S/ 84.50</span>
              </div>
              <p className="text-xs text-ink-muted">Atendido por: Mozo Carlos</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  className="bg-primary text-white font-bold py-3 rounded-xl min-h-[48px] active:scale-98 text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Cobrar Efectivo</span>
                </button>
                <button
                  type="button"
                  className="bg-brand-surface text-white font-bold py-3 rounded-xl min-h-[48px] active:scale-98 text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Cobrar Yape / Plin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Barra de Navegación Inferior Táctil (Bottom Navigation Bar - Thumb Zone) */}
      <nav className="h-16 bg-surface border-t border-line px-6 flex items-center justify-around shrink-0 shadow-lg">
        <button
          type="button"
          className="flex flex-col items-center justify-center text-primary gap-1 min-w-[56px] min-h-[48px]"
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-bold">Salón</span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center justify-center text-ink-muted hover:text-ink gap-1 min-w-[56px] min-h-[48px]"
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-medium">Pedidos</span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center justify-center text-ink-muted hover:text-ink gap-1 min-w-[56px] min-h-[48px] relative"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Alertas</span>
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-danger"></span>
        </button>
      </nav>
    </div>
  );
};

export default App;
