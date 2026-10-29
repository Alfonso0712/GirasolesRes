import { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { setTheme } from './hooks/useTheme';
import { obtenerTemaActual } from './services/perfilService';
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
  const [currentPage, setCurrentPage] = useState<'login' | 'forgot-password' | 'home'>('login');
  const [session, setSession] = useState<UserSession | null>(null);
  const [logoutBanner, setLogoutBanner] = useState<BannerState>(null);

  const handleLogout = useCallback((banner?: BannerState) => {
    clearStoredSession();
    setSession(null);
    setLogoutBanner(banner || null);
    setCurrentPage('login');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState(null, '', '/login');
    }
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler((banner) => {
      handleLogout(banner);
    });
    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [handleLogout]);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) {
      setSession(null);
      setCurrentPage('login');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
      setVerificandoSesion(false);
      return;
    }

    try {
      const parsed: UserSession = JSON.parse(saved);
      const validation = validateJwtToken(parsed?.token, 10);

      if (!parsed || !parsed.usuario || !parsed.rol || !validation.valid) {
        clearStoredSession();
        setSession(null);
        setLogoutBanner({
          type: 'warning',
          message: SESSION_EXPIRED_MESSAGE,
        });
        setCurrentPage('login');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.history.replaceState(null, '', '/login');
        }
        setVerificandoSesion(false);
        return;
      }

      resetUnauthorizedGuard();
      setSession(parsed);
      setCurrentPage('home');
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        window.history.replaceState(null, '', '/');
      }
      setVerificandoSesion(false);

      // Sincronizar tema del servidor en segundo plano sin bloquear el render
      obtenerTemaActual(parsed.token)
        .then((serverTheme) => {
          if (serverTheme === 'light' || serverTheme === 'dark') {
            setTheme(serverTheme);
          }
        })
        .catch(() => {
          // Silenciosamente ignorar fallos de red; 401 ya es gestionado por apiClient
        });
    } catch {
      clearStoredSession();
      setSession(null);
      setLogoutBanner({
        type: 'warning',
        message: SESSION_EXPIRED_MESSAGE,
      });
      setCurrentPage('login');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
      setVerificandoSesion(false);
    }
  }, []);

  const handleLoginSuccess = (userSession: UserSession) => {
    if (userSession.tema === 'light' || userSession.tema === 'dark') {
      setTheme(userSession.tema);
    }
    const { tema: _, ...sessionToStore } = userSession;
    resetUnauthorizedGuard();
    setSession(sessionToStore);
    setLogoutBanner(null);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToStore));
    setCurrentPage('home');
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleUpdateSession = (newSession: UserSession) => {
    const { tema: _, ...sessionToStore } = newSession;
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

  return currentPage === 'login' ? (
    <LoginPage
      onSuccess={handleLoginSuccess}
      onForgotPasswordClick={() => {
        setLogoutBanner(null);
        setCurrentPage('forgot-password');
      }}
      initialBanner={logoutBanner}
    />
  ) : (
    <ForgotPasswordPage onBackToLogin={() => setCurrentPage('login')} />
  );
}

export default App;
