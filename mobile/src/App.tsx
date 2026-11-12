import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Utensils,
  ChefHat,
  Receipt,
  User,
  Sun,
  Moon,
  CheckCircle,
  BarChart3,
  Lock,
  Clock,
  CalendarCheck,
  ShoppingBag
} from 'lucide-react';
import type { UserSession, RolUsuario } from './types/auth';
import type { MesaItem } from './types/mesa';
import { authService } from './services/authService';
import { LoginView } from './components/auth/LoginView';
import { ViewSkeleton } from './components/ui/ViewSkeleton';
import { markAppReady } from './utils/boot';
import { useHaptics } from './hooks/useHaptics';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import logoGirasoles from './assets/logo-girasoles.png';

// Carga diferida (lazy loading) para vistas de rol para acelerar el arranque
const MesasView = lazy(() => import('./components/mesas/MesasView').then(m => ({ default: m.MesasView })));
const PedidoMesaView = lazy(() => import('./components/pedidos/PedidoMesaView').then(m => ({ default: m.PedidoMesaView })));
const MisPedidosView = lazy(() => import('./components/pedidos/MisPedidosView').then(m => ({ default: m.MisPedidosView })));
const KdsView = lazy(() => import('./components/cocina/KdsView').then(m => ({ default: m.KdsView })));
const MenuDiaView = lazy(() => import('./components/cocina/MenuDiaView').then(m => ({ default: m.MenuDiaView })));
const CobroView = lazy(() => import('./components/caja/CobroView').then(m => ({ default: m.CobroView })));
const CajaTurnoView = lazy(() => import('./components/caja/CajaTurnoView').then(m => ({ default: m.CajaTurnoView })));
const PedidoLlevarView = lazy(() => import('./components/caja/PedidoLlevarView').then(m => ({ default: m.PedidoLlevarView })));
const AdminReportesView = lazy(() => import('./components/admin/AdminReportesView').then(m => ({ default: m.AdminReportesView })));
const PerfilView = lazy(() => import('./components/perfil/PerfilView').then(m => ({ default: m.PerfilView })));

interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getDefaultTabForRole = (rol: RolUsuario): string => {
  switch (rol) {
    case 'Cocinero':
      return 'kds';
    case 'Cajero':
      return 'caja';
    case 'Administrador':
      return 'reportes';
    case 'Mozo':
    default:
      return 'salon';
  }
};

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => authService.getStoredSession());
  const [activeTab, setActiveTab] = useState<string>(() => {
    const s = authService.getStoredSession();
    return s ? getDefaultTabForRole(s.rol) : 'salon';
  });
  const [mesaEnPedido, setMesaEnPedido] = useState<MesaItem | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('girasoles_theme') === 'dark' || document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const { triggerLight } = useHaptics();

  // Ocultar pantalla de arranque cuando la app y la vista inicial estén montadas
  useEffect(() => {
    markAppReady();
  }, []);

  // Definición de pestañas permitidas estrictamente según el rol del usuario (RBAC)
  const getTabsForRole = (rol: RolUsuario): NavTabItem[] => {
    switch (rol) {
      case 'Mozo':
        return [
          { id: 'salon', label: 'Salón', icon: Utensils },
          { id: 'mis-pedidos', label: 'Pedidos', icon: Clock },
          { id: 'perfil', label: 'Perfil', icon: User },
        ];
      case 'Cocinero':
        return [
          { id: 'kds', label: 'Cocina KDS', icon: ChefHat },
          { id: 'menu-dia', label: 'Platos', icon: CalendarCheck },
          { id: 'perfil', label: 'Perfil', icon: User },
        ];
      case 'Cajero':
        return [
          { id: 'caja', label: 'Caja', icon: Lock },
          { id: 'cobros', label: 'Cobros', icon: Receipt },
          { id: 'llevar', label: 'Llevar', icon: ShoppingBag },
          { id: 'salon', label: 'Salón', icon: Utensils },
          { id: 'perfil', label: 'Perfil', icon: User },
        ];
      case 'Administrador':
      default:
        return [
          { id: 'reportes', label: 'Reportes', icon: BarChart3 },
          { id: 'salon', label: 'Salón', icon: Utensils },
          { id: 'caja', label: 'Caja Turno', icon: Lock },
          { id: 'perfil', label: 'Perfil', icon: User },
        ];
    }
  };

  const tabsDisponibles = session ? getTabsForRole(session.rol) : [];

  // Derivación síncrona: si activeTab no pertenece al rol, renderizar la inicial del rol
  const currentTab = tabsDisponibles.some((t) => t.id === activeTab)
    ? activeTab
    : (session ? getDefaultTabForRole(session.rol) : 'salon');

  const initialTabForRole = session ? getDefaultTabForRole(session.rol) : 'salon';

  const showToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setTimeout(() => setToastMensaje(null), 3500);
  };

  // Manejo del botón Atrás nativo de Android con prioridades
  useAndroidBackButton({
    currentTab,
    initialTab: initialTabForRole,
    onGoToInitialTab: () => {
      triggerLight();
      setActiveTab(initialTabForRole);
    },
    showToast,
  });

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('girasoles_theme', next ? 'dark' : 'light');
      } catch {}
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await authService.logout();
    setSession(null);
    setMesaEnPedido(null);
  };

  // Si no hay sesión activa -> mostrar pantalla de Login
  if (!session) {
    return (
      <div className="h-dvh w-full bg-canvas text-ink flex flex-col overflow-hidden">
        <LoginView
          onLoginSuccess={(s) => {
            setSession(s);
            setActiveTab(getDefaultTabForRole(s.rol));
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh w-full bg-canvas text-ink overflow-hidden">
      {/* 1. Cabecera Móvil y Tablet Superior */}
      <header className="h-14 bg-brand-dark text-white px-4 flex items-center justify-between shrink-0 shadow-md safe-top">
        <div className="flex items-center gap-2.5">
          <img
            src={logoGirasoles}
            alt="Logo Girasoles"
            width={32}
            height={32}
            decoding="async"
            className="w-8 h-8 rounded-lg object-contain shrink-0"
          />
          <div>
            <h1 className="text-sm font-extrabold leading-tight tracking-wide">Girasoles Res</h1>
            <p className="text-[10px] text-amber-200/80 uppercase font-semibold">
              {session.rol} · {session.nombre}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={isDark ? 'Modo Claro' : 'Modo Oscuro'}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-transform"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-100" />}
        </button>
      </header>

      {/* Toast Flotante */}
      {toastMensaje && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-success text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMensaje}</span>
        </div>
      )}

      {/* 2. Enrutador de Contenido Principal por Rol con Carga Diferida (Suspense) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Suspense fallback={<ViewSkeleton />}>
          {/* Vista de Salón y Pedidos de Mesa */}
          {currentTab === 'salon' && (
            mesaEnPedido ? (
              <PedidoMesaView
                mesa={mesaEnPedido}
                rol={session.rol}
                onVolver={() => setMesaEnPedido(null)}
                onPedidoExitoso={(msg) => {
                  setMesaEnPedido(null);
                  showToast(msg);
                }}
              />
            ) : (
              <MesasView
                onAbrirPedidoMesa={(mesa) => setMesaEnPedido(mesa)}
                onNavigateToCobro={session.rol === 'Cajero' ? () => setActiveTab('cobros') : undefined}
              />
            )
          )}

          {/* Vista Mozo: Mis Pedidos */}
          {currentTab === 'mis-pedidos' && <MisPedidosView />}

          {/* Vista Cocinero: KDS */}
          {currentTab === 'kds' && <KdsView />}

          {/* Vista Cocinero: Control de Menú y Platos Agotados */}
          {currentTab === 'menu-dia' && <MenuDiaView />}

          {/* Vista Cajero y Admin: Gestión de Caja */}
          {currentTab === 'caja' && (
            <CajaTurnoView onNavigateToCobros={() => setActiveTab('cobros')} />
          )}

          {/* Vista Cajero: Cobros de Mesas */}
          {currentTab === 'cobros' && <CobroView />}

          {/* Vista Cajero: Pedido para Llevar */}
          {currentTab === 'llevar' && (
            <PedidoLlevarView
              onPedidoCreado={(msg) => showToast(msg)}
              onIrACobros={() => setActiveTab('cobros')}
            />
          )}

          {/* Vista Administrador: Reportes y KPIs */}
          {currentTab === 'reportes' && <AdminReportesView />}

          {/* Vista Perfil y Ajustes */}
          {currentTab === 'perfil' && (
            <PerfilView
              session={session}
              isDark={isDark}
              onToggleDarkMode={toggleDarkMode}
              onLogout={handleLogout}
            />
          )}
        </Suspense>
      </main>

      {/* 3. Barra de Navegación Inferior Táctil Exclusiva por Rol */}
      {!mesaEnPedido && (
        <nav className="h-16 bg-surface border-t border-line px-2 flex items-center justify-around shrink-0 shadow-lg select-none safe-bottom">
          {tabsDisponibles.map((tab) => {
            const Icon = tab.icon;
            const activo = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerLight();
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[48px] px-1 transition-colors ${
                  activo ? 'text-primary font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] truncate max-w-[64px]">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default App;
