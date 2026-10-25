import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { setTheme } from './hooks/useTheme';
import { obtenerTemaActual } from './services/perfilService';
import type { UserSession } from './types/auth';

export function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'forgot-password' | 'home'>('login');
  const [session, setSession] = useState<UserSession | null>(null);
  const [logoutBanner, setLogoutBanner] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('girasoles_session');
    if (saved) {
      try {
        const parsed: UserSession = JSON.parse(saved);
        setSession(parsed);
        setCurrentPage('home');

        // Sincronizar tema del servidor en segundo plano sin bloquear el render
        obtenerTemaActual(parsed.token)
          .then((serverTheme) => {
            if (serverTheme === 'light' || serverTheme === 'dark') {
              setTheme(serverTheme);
            }
          })
          .catch(() => {
            // Silenciosamente ignorar cualquier fallo de red/auth
          });
      } catch {
        localStorage.removeItem('girasoles_session');
      }
    }
  }, []);

  const handleLoginSuccess = (userSession: UserSession) => {
    if (userSession.tema === 'light' || userSession.tema === 'dark') {
      setTheme(userSession.tema);
    }
    const { tema: _, ...sessionToStore } = userSession;
    setSession(sessionToStore);
    setLogoutBanner(null);
    localStorage.setItem('girasoles_session', JSON.stringify(sessionToStore));
    setCurrentPage('home');
  };

  const handleUpdateSession = (newSession: UserSession) => {
    const { tema: _, ...sessionToStore } = newSession;
    setSession(sessionToStore);
    localStorage.setItem('girasoles_session', JSON.stringify(sessionToStore));
  };

  const handleLogout = (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => {
    setSession(null);
    localStorage.removeItem('girasoles_session');
    setLogoutBanner(banner || null);
    setCurrentPage('login');
  };

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
