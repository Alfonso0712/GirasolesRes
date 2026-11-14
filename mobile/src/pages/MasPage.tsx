import React, { useState, useEffect } from 'react';
import {
  Menu,
  CalendarCheck,
  User,
  ChevronRight,
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import { puede } from '../config/permisos';
import { useMenuDia } from '../hooks/useRecurso';
import { useBackHandler } from '../hooks/useBackHandler';
import { useHaptics } from '../hooks/useHaptics';
import { PageHeader } from '../components/layout/PageHeader';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DefinirMenuView } from '../components/menu-dia/DefinirMenuView';
import { PerfilView } from '../components/perfil/PerfilView';

export type SeccionMasAdmin = 'lista' | 'menu-dia' | 'perfil';

export interface OpcionMasItem {
  id: Exclude<SeccionMasAdmin, 'lista'>;
  titulo: string;
  subtitulo: string;
  icono: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  mostrarEstadoMenu?: boolean;
}

/**
 * Catálogo extensible de módulos administrativos bajo la pestaña "Más".
 * Diseñado para incorporar Productos y Usuarios en fases futuras.
 */
const OPCIONES_MAS_ADMIN: readonly OpcionMasItem[] = [
  {
    id: 'menu-dia',
    titulo: 'Menú del día',
    subtitulo: 'Definir menús completos, opciones y platos de carta de hoy',
    icono: CalendarCheck,
    mostrarEstadoMenu: true,
  },
  {
    id: 'perfil',
    titulo: 'Perfil y ajustes',
    subtitulo: 'Cuenta, modo oscuro, preferencia de mano y sesión',
    icono: User,
  },
];

export interface MasPageProps {
  session: UserSession;
  seccionInicial?: SeccionMasAdmin;
  onSeccionChange?: (seccion: SeccionMasAdmin) => void;
  isDark: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => Promise<void>;
  onVolverAlInicio: () => void;
  onCambiosSinGuardarChange?: (tieneCambios: boolean) => void;
  solicitudSalirPendiente?: (() => void) | null;
  onCancelarSolicitudSalir?: () => void;
}

export const MasPage: React.FC<MasPageProps> = ({
  session,
  seccionInicial = 'lista',
  onSeccionChange,
  isDark,
  onToggleDarkMode,
  onLogout,
  onVolverAlInicio,
  onCambiosSinGuardarChange,
  solicitudSalirPendiente = null,
  onCancelarSolicitudSalir,
}) => {
  const autorizado = puede(session.rol, 'menuDia.definir');
  const [seccion, setSeccion] = useState<SeccionMasAdmin>(seccionInicial);
  const { triggerLight } = useHaptics();

  useEffect(() => {
    setSeccion(seccionInicial);
  }, [seccionInicial]);

  const cambiarSeccion = (nueva: SeccionMasAdmin) => {
    setSeccion(nueva);
    onSeccionChange?.(nueva);
  };

  const { datos: menuHoy } = useMenuDia({
    enabled: autorizado && seccion === 'lista',
  });

  useBackHandler(seccion === 'perfil', () => {
    cambiarSeccion('lista');
    return true;
  });

  if (!autorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  if (seccion === 'menu-dia') {
    return (
      <DefinirMenuView
        onVolver={() => cambiarSeccion('lista')}
        onCambiosSinGuardarChange={onCambiosSinGuardarChange}
        solicitudSalirPendiente={solicitudSalirPendiente}
        onCancelarSolicitudSalir={onCancelarSolicitudSalir}
      />
    );
  }

  if (seccion === 'perfil') {
    return (
      <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
        <PageHeader
          title="Perfil y ajustes"
          subtitle="Configuración de cuenta y terminal móvil"
          icon={<User className="w-5 h-5 text-white" aria-hidden="true" />}
          onVolver={() => cambiarSeccion('lista')}
        />
        <PerfilView
          session={session}
          isDark={isDark}
          onToggleDarkMode={onToggleDarkMode}
          onLogout={onLogout}
        />
      </div>
    );
  }

  const etiquetaEstadoMenu = menuHoy?.definido
    ? 'Menú definido'
    : 'Menú no definido hoy';

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      <PageHeader
        title="Más"
        subtitle="Gestión del restaurante y ajustes de cuenta"
        icon={<Menu className="w-5 h-5 text-white" aria-hidden="true" />}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {OPCIONES_MAS_ADMIN.map((item) => {
          const Icono = item.icono;
          return (
            <Card
              key={item.id}
              accent="none"
              padding="none"
              interactive
              onClick={() => {
                triggerLight();
                cambiarSeccion(item.id);
              }}
              className="min-h-16 px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icono className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-ink leading-snug break-words">
                    {item.titulo}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5 break-words">
                    {item.subtitulo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.mostrarEstadoMenu && (
                  <StatusBadge estado={etiquetaEstadoMenu} />
                )}
                <ChevronRight
                  className="w-4 h-4 text-ink-muted shrink-0"
                  aria-hidden="true"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MasPage;
