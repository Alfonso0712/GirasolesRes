import { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { setTheme } from './hooks/useTheme';
import { setHandedness, applyUserHandedness, resetHandednessToDefault } from './hooks/useHandedness';
import { obtenerTemaActual, obtenerOrientacionActual } from './services/perfilService';
import {
  SESSION_STORAGE_KEY,
  SESSION_EXPIRED_MESSAGE,
  validateJwtToken,
  clearStoredSession,
  registerUnauthorizedHandler,
  resetUnauthorizedGuard,
} from './services/apiClient';
import type { UserSession } from './types/auth';

type BannerState = {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
} | null;

export function App() {
  const [verificandoSesion, setVerificandoSesion] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'forgot-password' | 'home'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/login') return 'login';
      if (window.location.pathname === '/forgot-password') return 'forgot-password';
    }
    return 'landing';
  });
  const [session, setSession] = useState<UserSession | null>(null);
  const [logoutBanner, setLogoutBanner] = useState<BannerState>(null);

  const navigateToLogin = useCallback(() => {
    setCurrentPage('login');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.pushState(null, '', '/login');
    }
  }, []);

  const navigateToLanding = useCallback(() => {
    setCurrentPage('landing');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  }, []);

  const navigateToForgotPassword = useCallback(() => {
    setLogoutBanner(null);
    setCurrentPage('forgot-password');
    if (typeof window !== 'undefined' && window.location.pathname !== '/forgot-password') {
      window.history.pushState(null, '', '/forgot-password');
    }
  }, []);

  const handleLogout = useCallback((banner?: BannerState) => {
    clearStoredSession();
    resetHandednessToDefault();
    setSession(null);
    setLogoutBanner(banner || null);
    setCurrentPage('login');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState(null, '', '/login');
    }
  }, []);

  // Escuchar retroceso/avance del navegador (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (session) {
        setCurrentPage('home');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/forgot-password') {
        setCurrentPage('forgot-password');
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [session]);

  useEffect(() => {
    registerUnauthorizedHandler((banner) => {
      handleLogout(banner);
    });
    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [handleLogout]);

  useEffect(() => {
    const isLoginPath = typeof window !== 'undefined' && window.location.pathname === '/login';
    const isForgotPath = typeof window !== 'undefined' && window.location.pathname === '/forgot-password';
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!saved) {
      setSession(null);
      if (isLoginPath) {
        setCurrentPage('login');
      } else if (isForgotPath) {
        setCurrentPage('forgot-password');
      } else {
        setCurrentPage('landing');
      }
      setVerificandoSesion(false);
      return;
    }

    try {
      const parsed: UserSession = JSON.parse(saved);
      const validation = validateJwtToken(parsed?.token, 10);

      if (!parsed || !parsed.usuario || !parsed.rol || !validation.valid) {
        clearStoredSession();
        resetHandednessToDefault();
        setSession(null);

        // Si el usuario estaba explícitamente en /login, mostramos el banner de sesión expirada
        if (isLoginPath) {
          setLogoutBanner({
            type: 'warning',
            message: SESSION_EXPIRED_MESSAGE,
          });
          setCurrentPage('login');
        } else if (isForgotPath) {
          setCurrentPage('forgot-password');
        } else {
          // Si estaba en la landing (/), no forzar al login; se mantiene en la landing
          setCurrentPage('landing');
        }
        setVerificandoSesion(false);
        return;
      }

      resetUnauthorizedGuard();
      setSession(parsed);
      applyUserHandedness(parsed.usuario);
      setCurrentPage('home');
      if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/forgot-password')) {
        window.history.replaceState(null, '', '/');
      }
      setVerificandoSesion(false);

      // Sincronizar tema y orientación del servidor en segundo plano sin bloquear el render
      obtenerTemaActual(parsed.token)
        .then((serverTheme) => {
          if (serverTheme === 'light' || serverTheme === 'dark') {
            setTheme(serverTheme);
          }
        })
        .catch(() => {
          // Silenciosamente ignorar fallos de red; 401 ya es gestionado por apiClient
        });

      obtenerOrientacionActual(parsed.token)
        .then((serverHandedness) => {
          if (serverHandedness === 'right' || serverHandedness === 'left') {
            setHandedness(serverHandedness, parsed.usuario);
          }
        })
        .catch(() => {
          // Silenciosamente ignorar cualquier fallo de red/auth
        });
    } catch {
      clearStoredSession();
      resetHandednessToDefault();
      setSession(null);
      if (isLoginPath) {
        setLogoutBanner({
          type: 'warning',
          message: SESSION_EXPIRED_MESSAGE,
        });
        setCurrentPage('login');
      } else {
        setCurrentPage('landing');
      }
      setVerificandoSesion(false);
    }
  }, []);

  const handleLoginSuccess = (userSession: UserSession) => {
    if (userSession.tema === 'light' || userSession.tema === 'dark') {
      setTheme(userSession.tema);
    }
    if (userSession.orientacion === 'right' || userSession.orientacion === 'left') {
      setHandedness(userSession.orientacion, userSession.usuario);
    } else {
      applyUserHandedness(userSession.usuario);
    }
    const { tema: _, orientacion: __, ...sessionToStore } = userSession;
    resetUnauthorizedGuard();
    setSession(sessionToStore);
    setLogoutBanner(null);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToStore));
    setCurrentPage('home');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleUpdateSession = (newSession: UserSession) => {
    const { tema: _, orientacion: __, ...sessionToStore } = newSession;
    resetUnauthorizedGuard();
    setSession(sessionToStore);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToStore));
  };

  if (verificandoSesion) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen w-full bg-canvas flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-accent mb-3 animate-pulse">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-ink">Verificando sesión…</p>
      </div>
    );
  }

  if (currentPage === 'home' && session) {
    return (
      <HomePage
        session={session}
        onLogout={handleLogout}
        onUpdateSession={handleUpdateSession}
      />
    );
  }

  if (currentPage === 'landing') {
    return <LandingPage onGoToLogin={navigateToLogin} />;
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onForgotPasswordClick={navigateToForgotPassword}
        initialBanner={logoutBanner}
        onBackToLanding={navigateToLanding}
      />
    );
  }

  return <ForgotPasswordPage onBackToLogin={navigateToLogin} />;
}

export default App;
