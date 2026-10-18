import React, { useEffect } from 'react';
import { Home, Users, ShieldCheck, DollarSign, Utensils, ChefHat, X, UtensilsCrossed, ClipboardList, ShoppingBag, ReceiptText, Receipt, Lock } from 'lucide-react';
import type { UserSession } from '../types/auth';
import logoGirasoles from '../assets/logo-girasoles.png';

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

  // Cerrar drawer con tecla Escape
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

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside (Fixed drawer on mobile/tablet, Static on desktop) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#482813] text-white h-full p-5 flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-xl select-none overflow-y-auto transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo Container & Mobile Close Button */}
          <div className="flex items-center justify-between mb-8 pl-1">
            <div className="w-18 h-18 rounded-2xl bg-white/95 p-1.5 shadow-md flex items-center justify-center border border-amber-900/30">
              <img
                src={logoGirasoles}
                alt="Girasoles Restaurante"
                className="w-full h-full object-contain"
              />
            </div>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Cerrar menú"
                className="lg:hidden p-2 text-amber-200/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Menu Navigation */}
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleNavigate('inicio')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                paginaActiva === 'inicio'
                  ? 'bg-[#D35400] text-white shadow-md font-semibold'
                  : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>Inicio</span>
            </button>

            {rol === 'Administrador' && (
              <button
                type="button"
                onClick={() => handleNavigate('usuarios')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'usuarios'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span>Usuarios</span>
              </button>
            )}

            {rol === 'Administrador' && (
              <button
                type="button"
                onClick={() => handleNavigate('productos')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'productos'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5 shrink-0" />
                <span>Productos</span>
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Cocinero') && (
              <button
                type="button"
                onClick={() => handleNavigate('menu-dia')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'menu-dia'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Utensils className="w-5 h-5 shrink-0" />
                <span>Menú del día</span>
              </button>
            )}

            {rol === 'Administrador' && (
              <button
                type="button"
                onClick={() => handleNavigate('roles')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'roles'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>Roles y permisos</span>
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Cajero') && (
              <button
                type="button"
                onClick={() => handleNavigate('caja')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'caja'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <DollarSign className="w-5 h-5 shrink-0" />
                  <span>Caja y Cobros</span>
                </div>
                {cajaEstado && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      cajaEstado === 'abierta'
                        ? 'bg-emerald-500 text-white'
                        : cajaEstado === 'anteriorSinCerrar'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-stone-600 text-amber-200'
                    }`}
                  >
                    {cajaEstado === 'abierta' ? 'Abierta' : cajaEstado === 'anteriorSinCerrar' ? 'Cierre pend.' : 'Cerrada'}
                  </span>
                )}
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Cajero') && (
              <button
                type="button"
                onClick={() => handleNavigate('ventas')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'ventas'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Receipt className="w-5 h-5 shrink-0" />
                <span>Gestión de Ventas</span>
              </button>
            )}

            {rol === 'Administrador' && (
              <button
                type="button"
                onClick={() => handleNavigate('historial-cierres')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'historial-cierres'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Lock className="w-5 h-5 shrink-0" />
                <span>Historial de Cierres</span>
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Mozo' || rol === 'Cajero') && (
              <button
                type="button"
                onClick={() => handleNavigate('mesas')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'mesas'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Utensils className="w-5 h-5 shrink-0" />
                <span>Mesas y Salón</span>
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Mozo') && (
              <button
                type="button"
                onClick={() => handleNavigate('pedidos-mesa')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'pedidos-mesa'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ClipboardList className="w-5 h-5 shrink-0" />
                <span>Tomar Pedido</span>
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Cajero') && (
              <button
                type="button"
                onClick={() => handleNavigate('pedidos-llevar')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'pedidos-llevar'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <span>Pedido para Llevar</span>
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Mozo' || rol === 'Cajero') && (
              <button
                type="button"
                onClick={() => handleNavigate('pedidos')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'pedidos'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <ReceiptText className="w-5 h-5 shrink-0" />
                  <span>Gestión de Pedidos</span>
                </div>
                {pedidosListosCount !== undefined && pedidosListosCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white animate-pulse">
                    {pedidosListosCount}
                  </span>
                )}
              </button>
            )}

            {(rol === 'Administrador' || rol === 'Cocinero') && (
              <button
                type="button"
                onClick={() => handleNavigate('cocina')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium flex items-center gap-3.5 transition-all min-h-[44px] cursor-pointer ${
                  paginaActiva === 'cocina'
                    ? 'bg-[#D35400] text-white shadow-md font-semibold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ChefHat className="w-5 h-5 shrink-0" />
                <span>Cocina (KDS)</span>
              </button>
            )}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-amber-900/40 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white tracking-wide">Acceso protegido</p>
            <p className="text-[11px] text-amber-200/70">Sesión segura y activa</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
