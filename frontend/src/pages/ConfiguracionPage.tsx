import React from 'react';
import {
  CheckCircle2,
  Sliders,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import { PageHeader, PageContainer } from '../components/layout';
import { useHandedness, type Handedness } from '../hooks/useHandedness';
import { actualizarOrientacion } from '../services/perfilService';

export interface ConfiguracionPageProps {
  session: UserSession;
  onLogout?: () => void;
}

export const ConfiguracionPage: React.FC<ConfiguracionPageProps> = ({ session }) => {
  const { handedness, setHandedness } = useHandedness();

  const handleSelectHandedness = (newHandedness: Handedness) => {
    setHandedness(newHandedness, session.usuario);
    try {
      actualizarOrientacion(newHandedness, session.token).catch(() => {
        // En caso de fallo de red o error de servidor, no revertir el estado visible
      });
    } catch {
      // Ignorar errores síncronos
    }
  };

  const isLeft = handedness === 'left';

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer className="pb-12">
        <PageHeader
          title="Configuración"
          subtitle="Elige cómo prefieres ubicar los controles del sistema según tu mano de uso."
        />

        <div className="max-w-3xl mx-auto select-none">
          <section className="bg-surface rounded-2xl border border-line p-5 sm:p-6 shadow-xs">
            {/* Cabecera */}
            <div className="flex items-center gap-3 pb-4 border-b border-line mb-5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">
                  Posición del menú y navegación
                </h2>
                <p className="text-xs text-ink-muted">
                  Acomoda la barra lateral en el lado de la pantalla que te resulte más accesible.
                </p>
              </div>
            </div>

            {/* Selector de Modos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opción Diestro */}
              <button
                type="button"
                onClick={() => handleSelectHandedness('right')}
                className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  !isLeft
                    ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-xs ring-1 ring-accent/20'
                    : 'border-line hover:border-line-strong hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-surface'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    <PanelLeft className="w-4 h-4 text-ink-muted" />
                    <span className="text-sm font-bold text-ink">Modo Diestro</span>
                  </div>
                  {!isLeft ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent text-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Activo
                    </span>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-line" />
                  )}
                </div>

                {/* Esquema universal de pantalla */}
                <div className="my-1.5 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-line/60">
                  <div className="flex gap-1.5 h-12 w-full text-[10px] font-bold">
                    {/* Barra lateral a la izquierda */}
                    <div className="w-1/3 rounded bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center text-center px-1">
                      Menú
                    </div>
                    {/* Contenido principal */}
                    <div className="flex-1 rounded bg-white dark:bg-neutral-900 border border-line/40 flex items-center justify-center text-ink-muted text-center px-1 font-medium">
                      Pantalla principal
                    </div>
                  </div>
                </div>

                <p className="text-xs text-ink-muted mt-2">
                  Menú de navegación a la <strong>izquierda</strong>.
                </p>
              </button>

              {/* Opción Zurdo */}
              <button
                type="button"
                onClick={() => handleSelectHandedness('left')}
                className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isLeft
                    ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-xs ring-1 ring-accent/20'
                    : 'border-line hover:border-line-strong hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-surface'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    <PanelRight className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold text-ink">Modo Zurdo</span>
                  </div>
                  {isLeft ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent text-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Activo
                    </span>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-line" />
                  )}
                </div>

                {/* Esquema universal de pantalla */}
                <div className="my-1.5 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-line/60">
                  <div className="flex gap-1.5 h-12 w-full text-[10px] font-bold">
                    {/* Contenido principal */}
                    <div className="flex-1 rounded bg-white dark:bg-neutral-900 border border-line/40 flex items-center justify-center text-ink-muted text-center px-1 font-medium">
                      Pantalla principal
                    </div>
                    {/* Barra lateral a la derecha */}
                    <div className="w-1/3 rounded bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center text-center px-1">
                      Menú
                    </div>
                  </div>
                </div>

                <p className="text-xs text-ink-muted mt-2">
                  Menú de navegación a la <strong>derecha</strong> para alcanzarlo con la mano izquierda.
                </p>
              </button>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
};

export default ConfiguracionPage;
