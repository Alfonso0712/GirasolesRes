import React from 'react';
import ReactDOM from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// Inicialización de barras del sistema en plataformas nativas
if (Capacitor.isNativePlatform()) {
  void StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  void StatusBar.setBackgroundColor({ color: '#482813' }).catch(() => {});
  void StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Ocultar splash nativo tras el primer render garantizando dos requestAnimationFrame
let splashHidden = false;
const hideSplash = async (): Promise<void> => {
  if (splashHidden) return;
  splashHidden = true;
  try {
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    // Entorno de desarrollo web o plataforma sin plugin nativo
  }
};

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    void hideSplash();
  });
});

// Respaldo de seguridad: ocultar splash nativo a los 4 s como máximo
setTimeout(() => {
  void hideSplash();
}, 4000);
