import React, { useState, useEffect, useMemo } from 'react';
import { Home, Settings } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import {
  NAVIGATION_GROUPS,
  resolveNavigation,
} from '../../config/navigationConfig';
import { useHandedness } from '../../hooks/useHandedness';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavGroup } from './sidebar/SidebarNavGroup';
import { SidebarFooter } from './sidebar/SidebarFooter';

interface SidebarProps {
  session?: UserSession | null;
  onLogout?: () => void;
  paginaActiva?: string;
  onSelectPagina?: (pagina: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  pedidosListosCount?: number;
  cajaEstado?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  session,
  paginaActiva = 'usuarios',
  onSelectPagina,
  isOpenMobile = false,
  onCloseMobile,
  pedidosListosCount,
  cajaEstado,
}) => {
  const rol = session?.rol;
  const { isLeftHanded } = useHandedness();

  // Cerrar drawer con tecla Escape en móvil
  useEffect(() => {
    if (!isOpenMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  const handleNavigate = (pagina: string) => {
    onSelectPagina?.(pagina);
    onCloseMobile?.();
  };

  const gruposConfig = NAVIGATION_GROUPS;

  // Filtrar grupos e ítems según el rol del usuario (Heurística 8 de Nielsen)
  const gruposVisibles = useMemo(() => {
    return gruposConfig
      .map((grupo) => ({
        ...grupo,
        items: grupo.items.filter((item) => !rol || item.roles.includes(rol)),
      }))
      .filter((grupo) => grupo.items.length > 0);
  }, [gruposConfig, rol]);

  const navState = useMemo(() => resolveNavigation(paginaActiva), [paginaActiva]);

  // Estado de apertura de acordeones (ISO 9241 - Eficiencia operativa):
  // - Roles con pocas opciones (Cajero, Mozo, Cocinero): grupos expandidos por defecto para ahorrar clics en hora pico.
  // - Administrador: modo acordeón compacto (inicia abierto el grupo activo para caber sin scroll en 768px).
  const [gruposAbiertos, setGruposAbiertos] = useState<Record<string, boolean>>(() => {
    const esAdmin = rol === 'Administrador';
    if (!esAdmin) {
      return {
        'salon-pedidos': true,
        'caja-ventas': true,
        'carta-menu': true,
        'administracion': true,
      };
    }
    const initial: Record<string, boolean> = {
      'salon-pedidos': false,
      'caja-ventas': false,
      'carta-menu': false,
      'administracion': false,
    };
    const activeGroupId = resolveNavigation(paginaActiva).groupId;
    if (activeGroupId) {
      initial[activeGroupId] = true;
    }
    return initial;
  });

  // Auto-apertura inteligente cuando cambia la ruta activa
  useEffect(() => {
    if (!paginaActiva || paginaActiva === 'inicio') return;
    if (navState.groupId) {
      const gid = navState.groupId;
      setGruposAbiertos((prev) => ({
        ...prev,
        [gid]: true,
      }));
    }
  }, [paginaActiva, navState.groupId]);

  const toggleGrupo = (grupoId: string) => {
    setGruposAbiertos((prev) => ({
      ...prev,
      [grupoId]: !prev[grupoId],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-fill-strong/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside (Fixed drawer en móvil/tablet, estático en desktop) */}
      <aside
        className={`fixed lg:static inset-y-0 ${
          isLeftHanded ? 'right-0' : 'left-0'
        } z-50 w-60 xl:w-64 2xl:w-72 bg-sidebar text-white h-full p-3.5 sm:p-4 xl:p-5 flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-xl select-none transition-transform duration-200 ease-in-out ${
          isOpenMobile
            ? 'translate-x-0'
            : isLeftHanded
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Bloque 1: Cabecera Fija con Logo y botón cerrar móvil (shrink-0) */}
        <SidebarHeader onCloseMobile={onCloseMobile} />

        {/* Bloque 2: Navegación Central Jerárquica con Acordeón y Scroll Invisible */}
        <nav className="flex-1 overflow-y-auto py-1 xl:py-2 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Botón Principal Fijo: Inicio */}
          <button
            type="button"
            onClick={() => handleNavigate('inicio')}
            className={`w-full text-left px-3 xl:px-3.5 py-2 2xl:py-2.5 rounded-xl text-sm xl:text-nav font-medium flex items-center gap-3 transition-all cursor-pointer mb-2 ${
              paginaActiva === 'inicio'
                ? 'bg-primary text-white shadow-md font-semibold'
                : 'text-[#FEF3C7]/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" />
            <span>Inicio</span>
          </button>

          {/* 4 Secciones Jerárquicas Desplegables (Acordeón) */}
          {gruposVisibles.map((grupo) => (
            <SidebarNavGroup
              key={grupo.id}
              grupo={grupo}
              isOpen={Boolean(gruposAbiertos[grupo.id])}
              tieneItemActivo={navState.groupId === grupo.id}
              cajaEstado={cajaEstado}
              paginaActiva={paginaActiva}
              pedidosListosCount={pedidosListosCount}
              onToggle={() => toggleGrupo(grupo.id)}
              onNavigate={handleNavigate}
            />
          ))}

          {/* Módulo de Configuración */}
          <div className="pt-2 mt-2 border-t border-sidebar-line/60">
            <button
              type="button"
              onClick={() => handleNavigate('configuracion')}
              className={`w-full text-left px-3 xl:px-3.5 py-2 2xl:py-2.5 rounded-xl text-sm xl:text-nav font-medium flex items-center gap-3 transition-all cursor-pointer ${
                paginaActiva === 'configuracion'
                  ? 'bg-primary text-white shadow-md font-semibold'
                  : 'text-[#FEF3C7]/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" />
              <span>Configuración</span>
            </button>
          </div>
        </nav>

        {/* Bloque 3: Pie Fijo de "Acceso protegido" (shrink-0) */}
        <SidebarFooter />
      </aside>
    </>
  );
};

export default Sidebar;
