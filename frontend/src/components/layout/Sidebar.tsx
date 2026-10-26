import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  ChevronDown,
  ShieldCheck,
  X
} from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { NAVIGATION_GROUPS, type NavigationItem } from '../../config/navigationConfig';
import logoGirasoles from '../../assets/LOGO_GIRASOLES.png';

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
  // Guard estricto RN-106: rol === 'Administrador' && (

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

  // Helper para renderizar badges dinámicos sobre ítems de navegación
  const renderItemBadge = (itemId: string) => {
    if (itemId === 'pedidos' && pedidosListosCount !== undefined && pedidosListosCount > 0) {
      return (
        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white animate-pulse">
          {pedidosListosCount}
        </span>
      );
    }
    if (itemId === 'caja' && cajaEstado) {
      return (
        <span
          className={`px-1.5 py-0.5 text-xs font-bold rounded-full shrink-0 ${
            cajaEstado === 'abierta'
              ? 'bg-emerald-500 text-white'
              : cajaEstado === 'anteriorSinCerrar'
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-[#57534E] text-[#FDE68A]'
          }`}
        >
          {cajaEstado === 'abierta'
            ? 'Abierta'
            : cajaEstado === 'anteriorSinCerrar'
            ? 'Cierre pend.'
            : 'Cerrada'}
        </span>
      );
    }
    return null;
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

  // Determina si un elemento o ruta secundaria (ej: pedidos-mesa, pedidos-llevar) activa la opción de Mesas
  const isItemActive = (item: NavigationItem, activePage: string) => {
    if (activePage === item.id) return true;
    if (item.matchPaths && item.matchPaths.includes(activePage)) return true;
    return false;
  };

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
    const activeGroup = gruposConfig.find((g) => g.items.some((i) => isItemActive(i, paginaActiva)));
    if (activeGroup) {
      initial[activeGroup.id] = true;
    }
    return initial;
  });

  // Auto-apertura inteligente cuando cambia la ruta activa
  useEffect(() => {
    if (!paginaActiva || paginaActiva === 'inicio') return;
    const parentGroup = gruposConfig.find((g) => g.items.some((i) => isItemActive(i, paginaActiva)));
    if (parentGroup) {
      setGruposAbiertos((prev) => ({
        ...prev,
        [parentGroup.id]: true,
      }));
    }
  }, [paginaActiva, gruposConfig]);

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 xl:w-64 2xl:w-72 bg-sidebar text-white h-full p-3.5 sm:p-4 xl:p-5 flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-xl select-none transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Bloque 1: Cabecera Fija con Logo y botón cerrar móvil (shrink-0) */}
        <div className="shrink-0 flex items-center justify-between pb-3 xl:pb-4 border-b border-sidebar-line mb-2">
          <div className="flex-1 flex items-center py-1">
            <img
              src={logoGirasoles}
              alt="Girasoles Restaurante"
              className="h-10 sm:h-11 xl:h-12 w-auto max-w-[190px] xl:max-w-[210px] object-contain drop-shadow-xs"
            />
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Cerrar menú"
              className="lg:hidden p-2 text-[#FDE68A]/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

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
          {gruposVisibles.map((grupo) => {
            const isOpen = Boolean(gruposAbiertos[grupo.id]);
            const tieneItemActivo = grupo.items.some((i) => isItemActive(i, paginaActiva));

            return (
              <div key={grupo.id} className="pt-1.5 first:pt-0">
                {/* Cabecera del Grupo Desplegable */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleGrupo(grupo.id)}
                  className="w-full text-xs xl:text-nav-sm font-bold uppercase tracking-wider text-[#D9C5B2]/80 hover:text-white px-3 py-2 flex items-center justify-between cursor-pointer rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{grupo.title}</span>

                    {/* Indicador de módulo activo cuando el grupo está colapsado (Nielsen 1) */}
                    {!isOpen && tieneItemActivo && (
                      <span
                        className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-2xs"
                        title="Módulo activo dentro de esta sección"
                      />
                    )}

                    {/* Indicador de estado de caja en la cabecera colapsada de Caja y Ventas */}
                    {!isOpen && grupo.id === 'caja-ventas' && cajaEstado && (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          cajaEstado === 'abierta'
                            ? 'bg-emerald-400'
                            : cajaEstado === 'anteriorSinCerrar'
                            ? 'bg-rose-400 animate-pulse'
                            : 'bg-[#A8A29E]'
                        }`}
                        title={`Caja: ${cajaEstado}`}
                      />
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white' : 'text-[#D9C5B2]/60'
                    }`}
                  />
                </button>

                {/* Sub-elementos con indentación y línea guía vertical sutil */}
                {isOpen && (
                  <div className="pl-3 border-l border-white/10 ml-3.5 space-y-1 mt-1 mb-2 animate-in fade-in duration-150">
                    {grupo.items.map((item) => {
                      const Icon = item.icon;
                      const esActivo = isItemActive(item, paginaActiva);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNavigate(item.id)}
                          className={`w-full text-left pl-3 pr-2 py-2 rounded-xl text-xs xl:text-sm font-medium flex items-center justify-between transition-all cursor-pointer ${
                            esActivo
                              ? 'bg-primary text-white shadow-md font-semibold'
                              : 'text-[#FEF3C7]/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 xl:w-4.5 xl:h-4.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {renderItemBadge(item.id)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bloque 3: Pie Fijo de "Acceso protegido" (shrink-0) */}
        <div className="shrink-0 pt-3 xl:pt-3.5 border-t border-sidebar-line flex items-center gap-3 mt-1">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white tracking-wide">Acceso protegido</p>
            <p className="text-xs text-[#FDE68A]/70">Sesión segura y activa</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

