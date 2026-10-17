import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
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
        const parsed = JSON.parse(saved);
        setSession(parsed);
        setCurrentPage('home');
      } catch {
        localStorage.removeItem('girasoles_session');
      }
    }
  }, []);

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    setLogoutBanner(null);
    localStorage.setItem('girasoles_session', JSON.stringify(userSession));
    setCurrentPage('home');
  };

  const handleUpdateSession = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('girasoles_session', JSON.stringify(newSession));
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
