import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import type { UserSession } from './types/auth';
import { authService } from './services/authService';
import { perfilService } from './services/perfilService';
import { LoginView } from './components/auth/LoginView';
import { ViewSkeleton } from './components/ui/ViewSkeleton';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { AccesoRestringido } from './components/layout/AccesoRestringido';
import { useToast } from './context/ToastContext';
import { markAppReady } from './utils/boot';
import { useHaptics } from './hooks/useHaptics';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { useKitchenNotifications } from './hooks/useKitchenNotifications';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useSessionLifecycle } from './hooks/useSessionLifecycle';
import { InactivitySheet } from './components/layout/InactivitySheet';
import { useComandas } from './hooks/useRecurso';
import {
  pestanaInicial,
  obtenerPestanasParaRol,
} from './config/navigation';

// Carga diferida (lazy loading) para páginas orquestadoras por rol
const SalonPage = lazy(() => import('./pages/SalonPage'));
const PedidosPage = lazy(() => import('./pages/PedidosPage'));
const CocinaPage = lazy(() => import('./pages/CocinaPage'));
const PlatosPage = lazy(() => import('./pages/PlatosPage'));
const CajaPage = lazy(() => import('./pages/CajaPage'));
const CobrosPage = lazy(() => import('./pages/CobrosPage'));
const LlevarPage = lazy(() => import('./pages/LlevarPage'));
const ReportesPage = lazy(() => import('./pages/ReportesPage'));
const InicioPage = lazy(() => import('./pages/InicioPage'));
const PerfilPage = lazy(() => import('./pages/PerfilPage'));

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => authService.getStoredSession());
  const [activeTab, setActiveTab] = useState<string>(() => {
    const s = authService.getStoredSession();
    return s ? pestanaInicial(s.rol) : 'salon';
  });
  const [enPedidoModo, setEnPedidoModo] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('girasoles_theme') === 'dark' || document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  const { triggerLight } = useHaptics();
  const { mostrar } = useToast();

  const showToast = useCallback((mensaje: string) => {
    mostrar({ tipo: 'exito', mensaje });
  }, [mostrar]);

  // Monitoreo de conectividad y aviso de reconexión
  useNetworkStatus(
    useCallback(() => {
      showToast('Conexión restablecida.');
    }, [showToast])
  );

  // Ocultar pantalla de arranque cuando la app y la vista inicial estén montadas
  useEffect(() => {
    markAppReady();
  }, []);

  // Pestañas canónicas autorizadas para el rol del usuario autenticado
  const tabsDisponibles = session ? obtenerPestanasParaRol(session.rol) : [];
  const esTabAutorizada = tabsDisponibles.some((t) => t.id === activeTab);
  const initialTabForRole = session ? pestanaInicial(session.rol) : 'salon';

  // Al cambiar de pestaña, desplazar hacia arriba
  const handleSelectTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  // Manejo del botón Atrás nativo de Android con prioridades
  useAndroidBackButton({
    currentTab: activeTab,
    initialTab: initialTabForRole,
    onGoToInitialTab: () => {
      triggerLight();
      handleSelectTab(initialTabForRole);
    },
    showToast,
  });

  // Notificaciones sonoras y visuales en tiempo real para avisos de cocina
  const { conteoAvisos } = useKitchenNotifications({
    rol: session?.rol,
    enabled: Boolean(session),
    onNuevoAviso: (aviso) => {
      const destino = aviso.mesa || (aviso.referencia ? `Para llevar (${aviso.referencia})` : 'Para llevar');
      showToast(`Pedido N.º ${aviso.numero} de ${destino} está listo para recoger.`);
    },
  });

  // Comandas pendientes para insignia en Cocinero si está en otra pestaña
  const { datos: comandasData } = useComandas({
    enabled: session?.rol === 'Cocinero',
  });
  const comandasPendientesCount =
    comandasData?.items?.filter((c) => c.estado === 'Pendiente').length || 0;

  // Insignias dinámicas de la barra de navegación
  const badges: Record<string, number> = {};
  if (conteoAvisos > 0) {
    if (session?.rol === 'Mozo') {
      badges.pedidos = conteoAvisos;
    } else if (session?.rol === 'Cajero') {
      badges.cobros = conteoAvisos;
    }
  }
  if (session?.rol === 'Cocinero' && activeTab === 'platos' && comandasPendientesCount > 0) {
    badges.cocina = comandasPendientesCount;
  }

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('girasoles_theme', next ? 'dark' : 'light');
      } catch {
        // Ignorar error de acceso a almacenamiento local
      }
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      perfilService.actualizarTema(next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLogout = useCallback(async (motivo?: string) => {
    try {
      await Promise.race([
        authService.logout(),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
    } catch {
      // Garantizar cierre local incluso sin conexión
    } finally {
      localStorage.removeItem('GIRASOLES_TOKEN');
      localStorage.removeItem('GIRASOLES_SESSION');
      setSession(null);
      setEnPedidoModo(false);
      if (motivo) {
        mostrar({ tipo: 'aviso', mensaje: motivo });
      }
    }
  }, [mostrar]);

  // Gestión de ciclo de vida de sesión e inactividad (RN-20 / RV-32)
  const {
    avisoInactividadVisible,
    segundosRestantes,
    renovando: renovandoSesion,
    continuarSesion,
    cerrarSesionInactividad,
  } = useSessionLifecycle({
    session,
    activeTab,
    onLogout: handleLogout,
  });

  // Si no hay sesión activa -> mostrar pantalla de Login
  if (!session) {
    return (
      <div className="h-dvh w-full bg-canvas text-ink flex flex-col overflow-hidden">
        <LoginView
          onLoginSuccess={(s) => {
            setSession(s);
            handleSelectTab(pestanaInicial(s.rol));
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh w-full bg-canvas text-ink overflow-hidden">
      {/* 1. Cabecera Móvil y Tablet Superior */}
      <AppHeader
        session={session}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* 2. Contenedor principal responsive: riel lateral en tableta (md:) e inferior en móvil */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {!enPedidoModo && (
          <BottomNav
            tabs={tabsDisponibles}
            currentTab={activeTab}
            onSelectTab={handleSelectTab}
            badges={badges}
            className="order-last md:order-first"
          />
        )}

        {/* Enrutador de Contenido Principal por Rol con Carga Diferida (Suspense) */}
        <main id="main-content" className="flex-1 flex flex-col overflow-hidden relative min-h-0 order-first md:order-last">
          <Suspense fallback={<ViewSkeleton />}>
            {!esTabAutorizada ? (
              <AccesoRestringido
                onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
              />
            ) : (
              <>
                {activeTab === 'inicio' && (
                  <InicioPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                    onNavigateTab={(tab) => handleSelectTab(tab)}
                  />
                )}

                {activeTab === 'salon' && (
                  <SalonPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                    onNavigateToCobro={session.rol === 'Cajero' ? () => handleSelectTab('cobros') : undefined}
                    onShowToast={showToast}
                    onPedidoModoChange={setEnPedidoModo}
                  />
                )}

                {activeTab === 'pedidos' && (
                  <PedidosPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                    onNavigateToSalon={() => handleSelectTab('salon')}
                    conteoAvisosListos={conteoAvisos}
                  />
                )}

                {activeTab === 'cocina' && (
                  <CocinaPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                    onShowToast={showToast}
                  />
                )}

                {activeTab === 'platos' && (
                  <PlatosPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                  />
                )}

                {activeTab === 'caja' && (
                  <CajaPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                    onNavigateToCobros={() => handleSelectTab('cobros')}
                  />
                )}

                {activeTab === 'cobros' && (
                  <CobrosPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                  />
                )}

                {activeTab === 'llevar' && (
                  <LlevarPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                    onShowToast={showToast}
                    onIrACobros={() => handleSelectTab('cobros')}
                  />
                )}

                {activeTab === 'reportes' && (
                  <ReportesPage
                    rol={session.rol}
                    onVolverAlInicio={() => handleSelectTab(initialTabForRole)}
                  />
                )}

                {activeTab === 'perfil' && (
                  <PerfilPage
                    session={session}
                    isDark={isDark}
                    onToggleDarkMode={toggleDarkMode}
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
          </Suspense>
        </main>
      </div>

      {/* Aviso de inactividad con cuenta regresiva (RN-20 / RV-32) */}
      <InactivitySheet
        isOpen={avisoInactividadVisible}
        segundosRestantes={segundosRestantes}
        renovando={renovandoSesion}
        onContinuar={continuarSesion}
        onCerrar={cerrarSesionInactividad}
      />
    </div>
  );
};

export default App;
