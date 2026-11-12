import React, { useState, useEffect } from 'react';
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
import { MesasView } from './components/mesas/MesasView';
import { PedidoMesaView } from './components/pedidos/PedidoMesaView';
import { MisPedidosView } from './components/pedidos/MisPedidosView';
import { KdsView } from './components/cocina/KdsView';
import { MenuDiaView } from './components/cocina/MenuDiaView';
import { CobroView } from './components/caja/CobroView';
import { CajaTurnoView } from './components/caja/CajaTurnoView';
import { PedidoLlevarView } from './components/caja/PedidoLlevarView';
import { AdminReportesView } from './components/admin/AdminReportesView';
import { PerfilView } from './components/perfil/PerfilView';
import { useHaptics } from './hooks/useHaptics';
import logoGirasoles from './assets/logo.png';

interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => authService.getStoredSession());
  const [activeTab, setActiveTab] = useState<string>('salon');
  const [mesaEnPedido, setMesaEnPedido] = useState<MesaItem | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const { triggerLight } = useHaptics();

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

  // Pestaña inicial por defecto al iniciar sesión
  useEffect(() => {
    if (session) {
      if (session.rol === 'Cocinero') setActiveTab('kds');
      else if (session.rol === 'Cajero') setActiveTab('caja');
      else if (session.rol === 'Administrador') setActiveTab('reportes');
      else setActiveTab('salon');
    }
  }, [session?.rol]);

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

  const handleLogout = async () => {
    await authService.logout();
    setSession(null);
    setMesaEnPedido(null);
  };

  const showToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setTimeout(() => setToastMensaje(null), 3500);
  };

  // Si no hay sesión activa -> mostrar pantalla de Login
  if (!session) {
    return (
      <div className="h-screen w-full bg-canvas text-ink flex flex-col overflow-hidden">
        <LoginView onLoginSuccess={(s) => setSession(s)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-canvas text-ink overflow-hidden safe-top safe-bottom">
      {/* 1. Cabecera Móvil y Tablet Superior */}
      <header className="h-14 bg-brand-dark text-white px-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <img
            src={logoGirasoles}
            alt="Logo Girasoles"
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

      {/* 2. Enrutador de Contenido Principal por Rol */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Vista de Salón y Pedidos de Mesa */}
        {activeTab === 'salon' && (
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
        {activeTab === 'mis-pedidos' && <MisPedidosView />}

        {/* Vista Cocinero: KDS */}
        {activeTab === 'kds' && <KdsView />}

        {/* Vista Cocinero: Control de Menú y Platos Agotados */}
        {activeTab === 'menu-dia' && <MenuDiaView />}

        {/* Vista Cajero y Admin: Gestión de Caja */}
        {activeTab === 'caja' && (
          <CajaTurnoView onNavigateToCobros={() => setActiveTab('cobros')} />
        )}

        {/* Vista Cajero: Cobros de Mesas */}
        {activeTab === 'cobros' && <CobroView />}

        {/* Vista Cajero: Pedido para Llevar */}
        {activeTab === 'llevar' && (
          <PedidoLlevarView
            onPedidoCreado={(msg) => showToast(msg)}
            onIrACobros={() => setActiveTab('cobros')}
          />
        )}

        {/* Vista Administrador: Reportes y KPIs */}
        {activeTab === 'reportes' && <AdminReportesView />}

        {/* Vista Perfil y Ajustes */}
        {activeTab === 'perfil' && (
          <PerfilView
            session={session}
            isDark={isDark}
            onToggleDarkMode={toggleDarkMode}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* 3. Barra de Navegación Inferior Táctil Exclusiva por Rol */}
      {!mesaEnPedido && (
        <nav className="h-16 bg-surface border-t border-line px-2 flex items-center justify-around shrink-0 shadow-lg select-none">
          {tabsDisponibles.map((tab) => {
            const Icon = tab.icon;
            const activo = activeTab === tab.id;
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
