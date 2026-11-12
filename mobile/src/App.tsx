import React, { useState, useEffect } from 'react';
import { Utensils, ChefHat, Receipt, User, Sun, Moon, CheckCircle } from 'lucide-react';
import type { UserSession } from './types/auth';
import type { MesaItem } from './types/mesa';
import { authService } from './services/authService';
import { LoginView } from './components/auth/LoginView';
import { MesasView } from './components/mesas/MesasView';
import { PedidoMesaView } from './components/pedidos/PedidoMesaView';
import { KdsView } from './components/cocina/KdsView';
import { CobroView } from './components/caja/CobroView';
import { PerfilView } from './components/perfil/PerfilView';
import { useHaptics } from './hooks/useHaptics';
import logoGirasoles from './assets/logo.png';

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => authService.getStoredSession());
  const [activeTab, setActiveTab] = useState<'mesas' | 'cocina' | 'caja' | 'perfil'>('mesas');
  const [mesaEnPedido, setMesaEnPedido] = useState<MesaItem | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const { triggerLight } = useHaptics();

  // Ajustar pestaña inicial según rol al iniciar sesión
  useEffect(() => {
    if (session) {
      if (session.rol === 'Cocinero') setActiveTab('cocina');
      else if (session.rol === 'Cajero') setActiveTab('caja');
      else setActiveTab('mesas');
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
    setTimeout(() => setToastMensaje(null), 3000);
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

      {/* 2. Enrutador de Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'mesas' && (
          mesaEnPedido ? (
            <PedidoMesaView
              mesa={mesaEnPedido}
              onVolver={() => setMesaEnPedido(null)}
              onPedidoExitoso={(msg) => {
                setMesaEnPedido(null);
                showToast(msg);
              }}
            />
          ) : (
            <MesasView
              onAbrirPedidoMesa={(mesa) => setMesaEnPedido(mesa)}
              onNavigateToCobro={() => setActiveTab('caja')}
            />
          )
        )}

        {activeTab === 'cocina' && <KdsView />}

        {activeTab === 'caja' && <CobroView />}

        {activeTab === 'perfil' && (
          <PerfilView
            session={session}
            isDark={isDark}
            onToggleDarkMode={toggleDarkMode}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* 3. Barra de Navegación Inferior Táctil (Thumb Zone - Solo si no está en medio de un pedido) */}
      {!mesaEnPedido && (
        <nav className="h-16 bg-surface border-t border-line px-4 flex items-center justify-around shrink-0 shadow-lg select-none">
          <button
            type="button"
            onClick={() => {
              triggerLight();
              setActiveTab('mesas');
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-colors ${
              activeTab === 'mesas' ? 'text-primary font-bold' : 'text-ink-muted'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px]">Salón</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerLight();
              setActiveTab('cocina');
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-colors ${
              activeTab === 'cocina' ? 'text-primary font-bold' : 'text-ink-muted'
            }`}
          >
            <ChefHat className="w-5 h-5" />
            <span className="text-[10px]">Cocina</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerLight();
              setActiveTab('caja');
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-colors ${
              activeTab === 'caja' ? 'text-primary font-bold' : 'text-ink-muted'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px]">Cobros</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerLight();
              setActiveTab('perfil');
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-colors ${
              activeTab === 'perfil' ? 'text-primary font-bold' : 'text-ink-muted'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Perfil</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
